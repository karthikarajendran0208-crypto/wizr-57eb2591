-- Migration to update enforce_mention_relevance to perform complete-word matching.
-- This ensures that keyword matching checks for word boundaries rather than matching arbitrary substrings.

CREATE OR REPLACE FUNCTION public.enforce_mention_relevance()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  haystack text;
  significant_tokens text[];
  significant_phrases text[];
  tok text;
  normalized_tok text;
  matched_distinct int := 0;
  has_phrase_match boolean := false;
  STOPWORDS text[] := ARRAY[
    -- Articulos / preposiciones / conectores ES
    'de','la','el','los','las','un','una','unos','unas','y','o','u','a','en','del',
    'al','por','para','con','sin','sobre','entre','que','es','se','lo','su','sus',
    -- EN
    'the','of','and','or','in','on','for','to','with','by','at','is','are','be','an',
    -- Genericos geograficos / institucionales que no aportan especificidad
    'puebla','mexico','mexicana','mexicano','ciudad','estado','municipio','colonia',
    'instituto','colegio','escuela','universidad','plantel','centro','fundacion','asociacion',
    'animal','animales','caso','casos','tema','temas','denuncia','denuncias',
    'noticia','noticias','informacion','reporte','reportes','video','videos','foto','fotos',
    'puebla.','mx','com','www','http','https'
  ];
BEGIN
  -- Normalize haystack: remove non-alphanumeric chars and collapse whitespace, then wrap in spaces
  haystack := regexp_replace(
    translate(lower(
      coalesce(NEW.title, '') || ' ' ||
      coalesce(NEW.description, '') || ' ' ||
      coalesce(NEW.url, '') || ' ' ||
      coalesce(NEW.source_domain, '') || ' ' ||
      coalesce(array_to_string(NEW.matched_keywords, ' '), '')
    ), 'áéíóúñàèìòùâêîôûäëïöüÁÉÍÓÚÑ', 'aeiounaeiouaeiouaeiouAEIOUN'),
    '[^a-z0-9]+', ' ', 'g'
  );
  haystack := ' ' || trim(regexp_replace(haystack, '\s+', ' ', 'g')) || ' ';

  WITH ent AS (
    SELECT palabras_clave, aliases, platform_keywords, nombre
    FROM entities
    WHERE project_id = NEW.project_id AND activo = true
  ),
  flat AS (
    SELECT unnest(palabras_clave) AS raw_phrase FROM ent
    UNION ALL
    SELECT unnest(aliases) FROM ent
    UNION ALL
    SELECT nombre FROM ent
    UNION ALL
    SELECT jsonb_array_elements_text(value)
      FROM ent, jsonb_each(platform_keywords)
      WHERE jsonb_typeof(value) = 'array'
  )
  SELECT array_agg(DISTINCT raw_phrase) INTO significant_phrases
  FROM flat
  WHERE raw_phrase IS NOT NULL AND length(raw_phrase) >= 3;

  -- Sin entidades configuradas → no filtramos
  IF significant_phrases IS NULL OR array_length(significant_phrases, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  -- 1) Match por frase completa (≥4 chars)
  FOREACH tok IN ARRAY significant_phrases LOOP
    -- Normalize the phrase the same way
    normalized_tok := regexp_replace(
      translate(lower(tok), 'áéíóúñàèìòùâêîôûäëïöüÁÉÍÓÚÑ', 'aeiounaeiouaeiouaeiouAEIOUN'),
      '[^a-z0-9]+', ' ', 'g'
    );
    normalized_tok := trim(regexp_replace(normalized_tok, '\s+', ' ', 'g'));
    
    IF length(normalized_tok) >= 4 AND position(' ' || normalized_tok || ' ' IN haystack) > 0 THEN
      has_phrase_match := true;
      EXIT;
    END IF;
  END LOOP;

  IF has_phrase_match THEN
    RETURN NEW;
  END IF;

  -- 2) Fallback: ≥2 tokens DISTINTOS significativos (≥4 chars, sin stopwords ampliadas)
  SELECT array_agg(DISTINCT t) INTO significant_tokens
  FROM (
    SELECT unnest(string_to_array(
      trim(regexp_replace(
        regexp_replace(
          translate(lower(phrase), 'áéíóúñàèìòùâêîôûäëïöüÁÉÍÓÚÑ', 'aeiounaeiouaeiouaeiouAEIOUN'),
          '[^a-z0-9]+', ' ', 'g'
        ), '\s+', ' ', 'g'
      )), ' '
    )) AS t
    FROM unnest(significant_phrases) AS phrase
  ) sub
  WHERE length(t) >= 4 AND NOT (t = ANY(STOPWORDS));

  IF significant_tokens IS NOT NULL THEN
    FOREACH tok IN ARRAY significant_tokens LOOP
      IF position(' ' || tok || ' ' IN haystack) > 0 THEN
        matched_distinct := matched_distinct + 1;
        IF matched_distinct >= 2 THEN
          RETURN NEW;
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- Sin coincidencia suficiente → descarta silenciosamente
  RETURN NULL;
END;
$function$;
