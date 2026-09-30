# Scratchpad: Wizr Codebase Functionality Explanation

**Wizr** is a comprehensive, full-stack **Social Listening, Media Intelligence, and Competitor Benchmarking Platform** developed for **KiMedia**. It allows teams to monitor public conversations, analyze sentiments, track competitors, generate AI-powered briefings/reports, and manage brand crises.

The system is built on a modern stack: **React (TypeScript) + Vite + Tailwind CSS + shadcn/ui** on the frontend, and **Supabase** (Authentication, Database, Edge Functions) on the backend.

---

## 1. System Architecture Overview

### Frontend Stack & Core Packages
- **Framework**: React 18 with TypeScript, bundled using **Vite**.
- **Styling**: **Tailwind CSS** combined with **shadcn/ui** components (leveraging Radix UI primitives).
- **Routing**: **React Router DOM v6** (defining protected routes, authentication guards, layouts, and public share routes).
- **State Management**: **Zustand** (global client stores) and **React Query** (TanStack Query) for asynchronous caching and database fetching.
- **Charts & Visualizations**: **Recharts** (interactive area, line, bar, and sentiment charts).
- **Animations**: **Framer Motion** (smooth micro-animations, slide-ins, and page transitions).
- **API Client**: `@supabase/supabase-js` for real-time listener and REST query execution.

### Backend Stack & Integrations
- **Supabase Core**: Handles user authentication, database tables, Row Level Security (RLS) policies, and database functions.
- **Scraping & Data Ingestion**:
  - **Apify Actors**: Used to scrape social media platforms (X/Twitter, Instagram, TikTok, etc.).
  - **BrightData**: Fallback/secondary web scraping provider.
  - **Firecrawl**: AI-powered web scraper for scraping and searching specific websites.
  - **Google News**: Scrapes and indexes RSS news feeds based on project keywords.
  - **YouTube API & RapidAPI (TikTok)**: Specialized APIs for scraping comments and video data.
- **AI & Processing (Claude)**: Integrates Anthropic's Claude LLM to perform semantic classification, sentiment analysis, narrative extraction, and auto-generated briefing summaries.
- **Reporting Services**: Uses **PDFShift** to convert HTML dashboard structures into downloadable PDFs.
- **Fanpage Karma (FK) Integration**: Parses and processes Excel exports (KPIs and Posts data sheets) to track and compare client/competitor performance.

---

## 2. Database Schema (`supabase/migrations` & `types.ts`)

The database contains tables organized into three key domains: System & Users, Listening (Monitoring), and Benchmarking (Fanpage Karma).

### Domain 1: System & Access Control
- **`access_requests`**: Manages registration requests for access (`email`, `full_name`, `reason`, `status` [pending/approved/rejected], `reviewed_by`).
- **`profiles`**: User profile details (`full_name`, `avatar_url`, `user_id`).
- **`user_roles`**: Links users to system roles (`admin`, `analista`, `director`).
- **`clients`**: Client organizations (`name`, `logo_url`, `client_type`, `services_enabled` JSON config) linked to account managers.

### Domain 2: Listening (Social Monitoring & Crisis Management)
- **`projects`**: The master monitoring entities configured with:
  - `tipo` (monitoreo, investigacion, crisis, benchmark).
  - `sensibilidad` (bajo, medio, alto, critico).
  - `alcance_temporal` (tiempo_real, diario, semanal, mensual, historico).
  - `objetivo` & `audiencia`.
- **`entities`**: Subjects monitored inside a project (people, brands, institutions, topics, events).
  - Configures `palabras_clave` (keywords), `aliases`, and `platform_keywords` JSON structures.
- **`mentions`**: Scraped occurrences of entities across web and social media.
  - Stores `url`, `title`, `description`, `source_domain`, `sentiment` (positivo, neutral, negativo), `relevance_score`, `matched_keywords`, `is_read`, and `is_archived`.
- **`post_comments`**: Comments on indexed mentions (`content`, `author_username`, `likes`, `sentiment`).
- **`alert_configs`**: Triggers for alert notifications based on negative sentiment spikes or keyword frequency thresholds.
- **`alert_notifications`**: Individual alert instances pushed to the dashboard or emailed.
- **`social_scrape_jobs`**: Logs scrape executions (`platform`, `search_type`, `search_value`, `status` [pending, running, completed, failed], `results_count`).
- **`social_results`**: Individual posts harvested from scrape jobs before ingestion/filter.
- **`auto_save_configs`**: Configures criteria to automatically move scraped `social_results` to `mentions` based on relevance score thresholds and required keywords.
- **`thematic_cards`**: AI-generated thematic groupings of mentions that summarize key narratives.

### Domain 3: Benchmarking (Competitive Performance)
- **`fk_profiles`**: Social media profiles tracked for clients or competitors (e.g., Facebook, Instagram, YouTube, TikTok, LinkedIn).
- **`fk_profile_kpis`**: Aggregated performance metrics (followers, follower growth rate, page performance index, reach, posts per day, impressions per interaction) for a defined period.
- **`fk_posts`**: Historical individual social posts (`message`, `likes`, `comments`, `shares`, `engagement`, `published_at`, `post_type`).
- **`fk_daily_top_posts`**: Tracks top-performing competitor posts on a daily basis.
- **`rankings`**: Customized groupings of `fk_profiles` to calculate league tables and rankings.

---

## 3. Main User Flows & Core Views

The application navigation is structured into **Onboarding**, **Listening**, **Performance (Benchmarking)**, and **Reporting**.

### Flow A: Conversational Onboarding (`ProjectWizard.tsx`)
Instead of a standard form, new projects are created using an interactive chat assistant (Wizr bot).
1. The assistant guides the user to select the **Product Type** (Performance, Listening, or Briefing).
2. For Listening, it asks for the **Depth** (Flash ⚡, Brief 📋, Deep Dive 🔍, or Investigation 📊).
3. The user inputs **Entities** (actors/brands/topics) and defines the **Target Audience** (e.g., "Crisis Committee", "Director of Communications").
4. Wizr automatically drafts the project's strategic objective, inserts records in `projects` and `entities` tables, and routes the user to the dashboard.

### Flow B: Dashboard Hub (`DashboardHomePage.tsx` & Layout)
- **Dashboard Layout**: Side navigation structure that collapses into icons, keeping project context globally available using the `ProjectContext`.
- **Dashboard Home**: Interactive hub allowing users to view ongoing projects, configure a new project, or jump directly into client benchmarking.

### Flow C: Listening & Media Ingestion (`FuentesPage.tsx`)
This page handles all data collection and has three main sub-tabs:
1. **Hub de Menciones**: Central repository of collected mentions. It displays sentiment cards and lets analysts edit details, archive items, or run bulk AI semantic analyses.
2. **Buscar (Search & Scraping)**:
   - *Búsqueda Unificada*: One-click scrape running across multiple networks for all configured entity keywords.
   - *Redes Sociales*: Run custom Apify/BrightData scripts for specific profiles or keywords.
   - *Google News*: Configures real-time news indexing.
   - *Comentarios*: Scrape comments under specific posts to assess public response.
   - *Historial Social*: Pull past posts for specific handles.
3. **Automatización**:
   - Configure scheduled background crawls (hourly/daily/weekly).
   - Configure auto-save filters.
   - Manually ingest list of custom URLs.
   - Enrich date metadata on scraped content.

### Flow D: Panoramic Analysis (`InsightsPage.tsx` & `SemanticaPage.tsx`)
- **Panorama (Vista General)**: Summarizes volume trends, platform distribution, and sentiment splits (positive vs. negative vs. neutral) using interactive area/line charts. Features a slide-out alerts panel.
- **Semántica**: Showcases AI-driven categories, word clouds, theme evolution, and automatic narrative synthesis. It highlights how many mentions remain unanalyzed and lets users trigger AI classification.
- **Comparativa (`ComparativaPage.tsx`)**: Side-by-side comparison of entities, showing share of voice (SOV) charts and sentiment comparisons.
- **Influenciadores (`InfluenciadoresPage.tsx`)**: Analyzes authors who mention the tracked brand/topics, ranking them by reach and engagement.

### Flow E: Competitor Benchmarking (`PerformancePage.tsx`)
This page focuses on comparing a client's social media performance against competitors.
- **FK Excel Importer (`FKExcelImporter.tsx`)**: Since raw social APIs are often restricted, this component handles importing data from **Fanpage Karma Excel exports**:
  - Parses KPI sheets to update profile stats.
  - Parses Posts sheets to sync historical posts.
  - Resolves profiles automatically using a canonical identity resolver.
  - Flags date overlaps and lets users overwrite or append data.
- **Performance Report**: Allows generating competitive reports detailing how a brand stacks up against its rivals in terms of post frequency, engagement rate, and follower growth.

### Flow F: Reporting & Sharing (`ReportesPage.tsx` & `PublicReportPage.tsx`)
- **Report Generator**: Combines AI insights with Recharts screenshots. Analysts can compile data into a structured brief.
- **Public Shared Reports**: Generates a cryptographically secure token (`/r/:token`) that lets external clients view interactive report dashboards without needing a Wizr account.

---

## 4. Edge Functions Breakdown (`supabase/functions`)

The application offloads heavy tasks and integrations to Supabase Edge Functions:
- **`scheduled-unified-search`**: Executes background scraping schedules on cron triggers.
- **`apify-scrape` / `brightdata-scrape`**: Connects to external scrapers.
- **`analyze-sentiment` / `analyze-semantics` / `generate-thematic-card`**: Connects to LLMs to tag, classify, and group mentions.
- **`generate-smart-report`**: AI writing engine that drafts reports for specific projects.
- **`generate-pdf-pdfshift`**: Generates high-fidelity PDF layouts from dashboard views.
- **`scheduled-ranking-sync`**: Periodically syncs rankings data with Fanpage Karma.

---

## 5. Agent-Reach Migration Strategy (Draft)

If we decide to migrate from commercial scrapers (Firecrawl / Apify) to **Agent-Reach** (Open-Source CLI layer), the architecture and timeline would look like this:

### Estimated Timeline (Adjusted for 2-3 hours/day: ~3 to 5 Weeks)
1. **Phase 1: Build a Python Backend Server (~3-6 days)** 
   Agent-Reach is a CLI tool for AI agents, not a REST API. We must build a wrapper (e.g., using Python FastAPI) to expose Agent-Reach capabilities as HTTP endpoints that the React frontend can consume.
2. **Phase 2: Refactor Frontend (`UnifiedSearch.tsx`) (~3-6 days)** 
   Replace Firecrawl and Apify API calls to point to the new Python Agent-Reach backend.
3. **Phase 3: Manage Authentication & Cookies (~6-12 days)** 
   Agent-Reach relies on local browser cookies for platforms like Facebook and Instagram. Deploying this to a cloud server requires a secure system to inject and manage session cookies in a headless environment.

### A/B Testing Architecture
To safely test Agent-Reach without breaking the live application, we can run a side-by-side architecture:
1. **Duplicate Frontend**: Copy the current frontend codebase and change the Vite port (e.g., `3001` instead of `3000`).
2. **Run Python Backend**: Spin up the Agent-Reach Python API on a separate port (e.g., `8000`).
3. **Compare**: Run both frontends simultaneously to evaluate speed, accuracy, and anti-bot reliability between Apify/Firecrawl and Agent-Reach.

---

## 6. Feedback on Search & Ingestion Flow (Q&A)

**1) Query flexibility (Multi-term searches):**
Yes, we can support this! We already have the AI Intent Parser (`parse-intent` Edge Function) configured for this exact use case. If a user types "Search for Actinver", the AI expands it into a comprehensive boolean query like `(Actinver OR #Actinver OR @Actinver OR @Actinver_mx)`. 
*Note on implementation:* The `handleAiSearch` function is written in `Search.tsx` but is not currently attached to any UI button. We need to add a "Smart Search" button. Also, because some Apify actors (like Instagram) don't process raw boolean operators well, we should tweak `parse-intent` to return structured arrays (`keywords: [], hashtags: [], handles: []`) so the frontend can route them correctly.

**2) Apify Cost & Optimization:**
Apify charges by "Compute Units" (time spent running headless browsers). Scraping 6 social platforms concurrently spins up heavy browser instances, making it expensive (especially for Facebook/Instagram due to anti-bot).
*Optimizations:* 
- Use Firecrawl for News/Blogs (already in the codebase and much cheaper).
- Cap `max_items` strictly.
- Use targeted Apify Actors rather than generic ones.
- Add an "Estimated Complexity" warning in the UI for massive date/platform ranges.

**3) Data Quality:**
The client-side Regex filtering you noticed in the code is successfully doing the heavy lifting to strip out noise after scrapers return raw data.

**4) Redefining the Tool (The "Define" Step):**
Absolutely. This "Search" interface is evolving into the **Ingestion/Capture Engine**. The "Define" step is creating an **Entity** (saved configuration of keywords, hashtags, competitors). The Search screen executes the capture for that Entity.

**5) Bug: Lost search on tab switch:**
*Cause:* Search results are currently held in temporary React State (`useState`). Switching tabs destroys the component memory.
*Fix:* We should save the "Search Job" and its results directly into a Supabase database table (`mentions`). When you navigate back, it fetches your past searches from the database.

**6) Navigation & Export (CSV, Filters, Pagination):**
*CSV Export:* We already have the `xlsx` package installed. Adding a "Download CSV" button is trivial.
*Navigation:* For large sets, we can convert the feed into a faceted view (like e-commerce) to filter by Platform, Author, or Date on a sidebar, and paginate results.

**7) Metrics & Impact (Engagement Data):**
Most Apify social scrapers *do* scrape engagement metrics (Likes, Retweets, Shares, Comments). The UI is currently just mapping `title`, `description`, and `author`. We need to update the `SearchResult` interface to capture `metrics: { likes, shares, comments }` and display them on the cards.

**8) News (Firecrawl vs Apify):**
For the News portion, we will route searches through **Firecrawl** (already configured in `firecrawl.ts`) instead of Apify to save balance and speed up text-based web scraping.

**9) Connecting the Workflow (Capture -> Analysis -> Reporting):**
This is the critical pipeline:
1. **Define:** User creates a Project/Entity.
2. **Capture (Search Screen):** User runs a search. We save raw mentions into a `mentions` table in Supabase.
3. **Analysis (Async):** Supabase Edge Functions wake up in the background, run the raw mentions through AI (OpenAI/Claude) for Sentiment, Semantics, and Narratives, and update the database rows.
4. **Reporting:** The dashboard (Semántica, Comparativa, Rankings, etc.) no longer searches the web. It simply reads from the structured, AI-analyzed `mentions` table to generate charts and PDF exports.
