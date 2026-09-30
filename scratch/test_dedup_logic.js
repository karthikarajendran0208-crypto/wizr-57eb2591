import { findDuplicates } from "../src/lib/utils/semanticDedup.js";

// Exact content from the screenshot
const card2 = {
  title: "Te lo tapamos? #tattoos #FYP #puebla #tintacafe #flores",
  description: "... Fundación Patitas Enlodadas AC #tattoos #puebla #tintacafe #parati - sonido original - oliverxmichel. 79Me gusta. 2Comentarios. 0Veces compartido.",
  url: "https://www.tiktok.com/@oliverxmichel/video/1"
};

const card3 = {
  title: "A veces tenemos mucho tiempo libre @tiojuls #tattoos ... - TikTok",
  description: "... Fundación Patitas Enlodadas AC #tattoos #puebla #tintacafe #parati - sonido original - oliverxmichel. 79Me gusta. 2Comentarios. 0Veces compartido.",
  url: "https://www.tiktok.com/@oliverxmichel/video/2"
};

console.log("=== Testing Deduplication Logic ===");
console.log("Card 2 Title:", card2.title);
console.log("Card 3 Title:", card3.title);

const existingItems = [
  {
    id: "existing-card-2",
    title: card2.title,
    description: card2.description,
    url: card2.url
  }
];

const match = findDuplicates(card3, existingItems, 0.7);

if (match) {
  console.log("\n[SUCCESS] Duplicate detected!");
  console.log("Match Type:", match.matchType);
  console.log("Similarity:", match.similarity);
} else {
  console.log("\n[FAILED] Duplicate was NOT detected.");
}
