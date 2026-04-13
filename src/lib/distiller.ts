import OpenAI from "openai";
import type { DistillationType, DistillationContent } from "./types";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `You are the Distiller — an expert knowledge synthesizer. Your job is to take raw research material about a topic and distill it into a structured, deeply insightful knowledge artifact.

You extract the ESSENCE of things: the core truth, the origin story, the principles, the applications, the limitations, and the connections.

Output ONLY valid JSON matching the schema below. No markdown wrapping, no code fences.`;

function buildUserPrompt(
  topic: string,
  type: DistillationType,
  researchText: string
): string {
  const typeInstructions: Record<DistillationType, string> = {
    concept: `This is a CONCEPT distillation. Focus on:
- The core idea in its simplest form (essence)
- How it originated and evolved (origin_story)
- The fundamental principles/axioms (key_principles — 3-6)
- Real-world applications across domains (applications — 3-5)
- Known limitations and edge cases where it breaks (limitations — 3-5)
- Common misconceptions people have (misconceptions — 2-4)
- Connections to related ideas (connections — 3-6)
- Key figures who developed or popularized it (key_figures)
- Important dates and milestones (timeline)
- Memorable quotes (quotes — 2-4)`,

    formula: `This is a FORMULA distillation. Focus on:
- What the formula computes and WHY it matters (essence)
- The story of its discovery/derivation (origin_story)
- Each variable/parameter and its intuitive meaning (key_principles)
- Where this formula is used in practice (applications — 3-5)
- Assumptions that must hold — and when they break (limitations — 4-6)
- Common mistakes in applying it (misconceptions — 2-4)
- Related formulas and mathematical connections (connections)
- The mathematicians/scientists behind it (key_figures)
- Historical development timeline (timeline)
- Include the actual formula notation in the essence`,

    event: `This is an EVENT distillation. Focus on:
- What happened and why it matters, in one paragraph (essence)
- The build-up and context that led to it (origin_story)
- Root causes and contributing factors (key_principles — framed as "causes")
- Impact and consequences across domains (applications — framed as "consequences")
- What could have gone differently (limitations — framed as "counter-narratives")
- Common myths or oversimplifications (misconceptions)
- Related events and ripple effects (connections)
- Key players and their roles (key_figures — be specific)
- Detailed chronological timeline (timeline — be thorough)
- Memorable quotes from the era (quotes)`,

    history: `This is a HISTORY distillation. Focus on:
- The defining arc and significance of this period/movement (essence)
- How it began — the conditions that created it (origin_story)
- The major phases or periods within it (key_principles — framed as "phases")
- How it shaped the modern world (applications — framed as "legacy")
- Controversies and contested interpretations (limitations — framed as "debates")
- Oversimplified popular narratives vs. nuanced reality (misconceptions)
- Connections to other historical periods and movements (connections)
- The central figures and their contributions (key_figures)
- Comprehensive timeline (timeline)
- Defining quotes of the era (quotes)`,

    philosophy: `This is a PHILOSOPHY distillation. Focus on:
- The central thesis or worldview in plain language (essence)
- How this school of thought emerged (origin_story)
- Core tenets and principles (key_principles — 4-7)
- How to apply it in daily life and decision-making (applications — 3-5)
- The strongest objections and critiques (limitations — framed as "critiques")
- What people get wrong about it (misconceptions — 2-4)
- Related and opposing philosophies (connections)
- Key thinkers and their specific contributions (key_figures)
- Evolution over time (timeline)
- Essential quotes (quotes — 3-5)`,

    question: `This is a QUESTION distillation. The user asked a big question — give a deep, multi-perspective answer. Focus on:
- The best current answer distilled into 2-3 clear sentences (essence)
- How humanity has grappled with this question over time (origin_story)
- Multiple perspectives/schools of thought on this answer (key_principles — frame as "perspectives", 3-6)
- Practical implications — how the answer affects decisions and life (applications — 3-5)
- What we still don't know — honest gaps and uncertainties (limitations — frame as "open questions", 3-5)
- Common wrong answers and why they persist (misconceptions — 3-4)
- Related questions this leads to (connections — 4-6)
- Key thinkers who shaped the answer (key_figures)
- How the answer evolved over time (timeline)
- Memorable quotes about this question (quotes — 3-5)
Don't give a single "right answer" — show the landscape of thinking. Be honest about uncertainty.`,

    book: `This is a BOOK distillation. Focus on:
- The core thesis/argument in 2-3 sentences (essence)
- Why the author wrote it — context and motivation (origin_story)
- Key ideas chapter by chapter (key_principles — frame as "key ideas", 5-8)
- Practical takeaways — what the reader should DO differently (applications — 4-6)
- Weaknesses, blind spots, what critics say (limitations — 3-5)
- What people misunderstand about this book (misconceptions — 2-3)
- Related books and intellectual connections (connections — 4-6)
- The author and their credibility (key_figures)
- Publication and impact timeline (timeline)
- Best passages and quotes (quotes — 4-6)`,

    company: `This is a COMPANY distillation. Focus on:
- What this company does and why it matters, in 2-3 sentences (essence)
- The founding story and early struggles (origin_story)
- Business model mechanics — how it makes money (key_principles — frame as "business model pillars", 4-6)
- Competitive advantages and moats (applications — frame as "strategic advantages", 3-5)
- Biggest risks, threats, and weaknesses (limitations — 4-6)
- Common misconceptions about this company (misconceptions — 2-4)
- Key competitors and industry connections (connections)
- Leadership team and key figures (key_figures)
- Company timeline with milestones (timeline)
- Defining statements from leadership (quotes — 3-5)`,

    technology: `This is a TECHNOLOGY distillation. Focus on:
- What this technology does and why it matters (essence)
- How it was invented and evolved (origin_story)
- How it works — key components explained simply (key_principles — 4-6)
- Real-world applications and use cases (applications — 4-6)
- Current limitations and unsolved problems (limitations — 4-6)
- Common misconceptions and hype vs reality (misconceptions — 3-4)
- Related technologies and alternatives (connections)
- Key inventors, contributors, companies (key_figures)
- Evolution timeline (timeline)
- Defining quotes about this technology (quotes — 2-4)`,

    skill: `This is a SKILL distillation. Focus on:
- What this skill is and why it's valuable (essence)
- Brief history of how this skill developed (origin_story)
- Core techniques and fundamentals a learner must master (key_principles — frame as "core techniques", 5-8)
- Where and how this skill applies professionally and personally (applications — 4-6)
- Common plateaus, mistakes, and failure modes (limitations — frame as "common pitfalls", 4-6)
- Myths about learning this skill (misconceptions — 3-4)
- Related skills and learning paths (connections)
- Famous masters and practitioners to study (key_figures)
- Learning progression timeline from beginner to expert (timeline)
- Wisdom from masters about this skill (quotes — 3-5)`,

    debate: `This is a DEBATE distillation. Distill BOTH sides fairly. Focus on:
- What the debate is about and why it matters (essence)
- How this debate originated and evolved (origin_story)
- The FOR side — 3-4 strongest arguments with evidence (key_principles — frame as "arguments FOR")
- The AGAINST side — 3-4 strongest arguments with evidence (applications — frame as "arguments AGAINST")
- What both sides get wrong or oversimplify (limitations — frame as "blind spots on both sides")
- Common strawman arguments and misconceptions (misconceptions — 3-4)
- Related debates and connected issues (connections)
- Key voices on each side (key_figures — include both sides, label their position)
- How the debate has evolved over time (timeline)
- Defining quotes from both sides (quotes — 4-6, balanced)
IMPORTANT: Be genuinely balanced. Present each side at its strongest, not as a caricature.`,

    person: `This is a PERSON distillation — like distilling a cognitive operating system.
Focus on HOW this person THINKS, not just WHAT they did.

REQUIRED SECTIONS (populate ALL of these):
- Who they are and why they matter in 2-3 sentences (essence)
- Their origin story — formative experiences that shaped their thinking (origin_story)
- 3-7 MENTAL MODELS — the core lenses they use to see the world (mental_models). Each needs:
  name, one_line summary, 2+ evidence examples from different domains, application scenario, and limitation
  A mental model must: appear across 2+ domains (cross-domain), predict their stance on new issues (generative), be unique to them (exclusive)
- 5-10 DECISION HEURISTICS — their fast judgment rules as "if X, then Y" (decision_heuristics)
- EXPRESSION DNA — how they talk (expression_dna): sentence style, vocabulary/forbidden words, rhythm, humor type, certainty level, catchphrases
- VALUES & ANTI-PATTERNS (values_and_antipatterns): what they pursue (ranked), what they refuse to do, internal tensions/contradictions
- INTELLECTUAL LINEAGE — who influenced them, who they influenced (intellectual_lineage as string)
- Career/life timeline with thinking evolution (timeline)
- Their best quotes that reveal thinking style (quotes — 4-6)
- Key figures in their orbit (key_figures)
- Connections to related thinkers/schools (connections)
- What this distillation CANNOT capture — honesty boundary (limitations — 3-5)
- Common misunderstandings about this person (misconceptions — 2-4)

Also populate key_principles (framed as "core beliefs") and applications (framed as "domains of influence").`,
  };

  return `TOPIC: "${topic}"
TYPE: ${type}

${typeInstructions[type]}

RESEARCH MATERIAL:
${researchText}

Return a JSON object with this structure (include ALL fields, add person-specific fields if type is person):
{
  "essence": "1-3 sentence core distillation — the absolute essence",
  "origin_story": "2-4 paragraph narrative of how this came to be",
  "sections": [
    { "id": "unique-id", "title": "Section Title", "content": "Markdown content", "type": "text" }
  ],
  "key_principles": [
    { "name": "Name", "description": "Clear explanation", "example": "Concrete example" }
  ],
  "applications": [
    { "domain": "Field/Area", "description": "How it applies", "example": "Specific case" }
  ],
  "limitations": ["Specific limitation 1", "Specific limitation 2"],
  "misconceptions": ["Common misconception 1"],
  "connections": [
    { "title": "Related Topic", "relation": "How they connect" }
  ],
  "key_figures": [
    { "name": "Person", "role": "Their role", "contribution": "What they did" }
  ],
  "timeline": [
    { "date": "Year or date", "event": "What happened", "significance": "Why it matters" }
  ],
  "quotes": [
    { "text": "The quote", "attribution": "Who said it" }
  ]${type === "person" ? `,
  "mental_models": [
    { "name": "Model Name", "one_line": "Brief description", "evidence": ["Example from domain A", "Example from domain B"], "application": "When to use this lens", "limitation": "When it fails" }
  ],
  "decision_heuristics": [
    { "rule": "Rule name", "description": "If X, then Y — concrete rule", "example": "Real case where they applied this" }
  ],
  "expression_dna": {
    "sentence_style": "Short/long, question ratio, analogy density",
    "vocabulary": "High-frequency words, proprietary terms, forbidden words",
    "rhythm": "Conclusion-first or build-up, transition style",
    "humor": "Sarcasm/self-deprecation/absurdist/deadpan/none",
    "certainty": "How they express confidence or doubt",
    "catchphrases": ["Phrase 1", "Phrase 2"]
  },
  "values_and_antipatterns": {
    "values": ["Value 1 (most important)", "Value 2"],
    "antipatterns": ["What they refuse to do 1"],
    "tensions": ["Internal contradiction 1"]
  },
  "intellectual_lineage": "Who influenced them → Them → Who they influenced"` : ""}
}

Be thorough, specific, and insightful. Use the research material but synthesize — don't just summarize. Find the non-obvious connections. Make every section count.`;
}

export async function distill(
  topic: string,
  type: DistillationType,
  researchText: string
): Promise<{ content: DistillationContent; subtitle: string }> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(topic, type, researchText) },
    ],
    temperature: 0.7,
    max_completion_tokens: 8000,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("Empty response from LLM");

  const content = JSON.parse(text) as DistillationContent;

  const subtitleResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Given this essence: "${content.essence}"\n\nWrite a subtitle for "${topic}" in 5-10 words. Punchy, insightful, no quotes. Just the subtitle text, nothing else.`,
      },
    ],
    max_tokens: 50,
  });

  const subtitle =
    subtitleResponse.choices[0]?.message?.content?.trim() || "";

  return { content, subtitle };
}

const KNOWN_PERSONS = [
  "elon musk", "steve jobs", "warren buffett", "charlie munger",
  "jeff bezos", "bill gates", "mark zuckerberg", "sam altman",
  "jensen huang", "satya nadella", "tim cook", "larry page",
  "sergey brin", "peter thiel", "reid hoffman", "paul graham",
  "naval ravikant", "ray dalio", "george soros", "carl icahn",
  "nassim taleb", "richard feynman", "albert einstein",
  "nikola tesla", "isaac newton", "charles darwin",
  "marie curie", "ada lovelace", "alan turing",
  "aristotle", "plato", "socrates", "confucius", "sun tzu",
  "napoleon", "alexander the great", "julius caesar",
  "gandhi", "martin luther king", "nelson mandela",
  "leonardo da vinci", "michelangelo", "shakespeare",
  "beethoven", "mozart", "bach",
  "marx", "keynes", "adam smith", "hayek", "friedman",
  "chomsky", "foucault", "nietzsche", "kant", "hegel",
  "deng xiaoping", "mao zedong", "xi jinping",
  "jack ma", "pony ma", "zhang yiming", "ren zhengfei",
  "andy grove", "bob iger", "reed hastings", "travis kalanick",
  "brian chesky", "patrick collison", "tobi lutke",
  "andrej karpathy", "ilya sutskever", "demis hassabis",
  "yann lecun", "geoffrey hinton", "andrew ng",
  "mrbeast", "joe rogan", "lex fridman",
  "oprah", "obama", "trump", "biden",
];

export async function smartClassifyType(topic: string): Promise<DistillationType> {
  const hasNonAscii = /[^\x00-\x7F]/.test(topic);
  const heuristicResult = classifyType(topic);

  if (!hasNonAscii && heuristicResult !== "concept") {
    return heuristicResult;
  }

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Classify this topic into exactly ONE type. Reply with ONLY the type word, nothing else.

Types:
- person (a real human being — historical, living, famous, or obscure)
- concept (an idea, framework, mental model, theory)
- formula (equation, theorem, mathematical law)
- event (a specific historical event, crisis, battle)
- history (an era, period, civilization, movement)
- philosophy (school of thought, worldview, doctrine)
- book (a specific book or publication)
- company (a business, corporation, startup)
- technology (a technology, tool, engineering method)
- skill (a learnable ability, craft, technique)
- debate (a controversial topic with two sides)
- question (a deep or open-ended question)

Topic: "${topic}"

Type:`,
        },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const result = response.choices[0]?.message?.content?.trim().toLowerCase() || "";
    const validTypes: DistillationType[] = [
      "concept", "formula", "event", "history", "philosophy", "person",
      "book", "company", "technology", "skill", "debate", "question",
    ];
    if (validTypes.includes(result as DistillationType)) {
      return result as DistillationType;
    }
  } catch {
    // fallback to heuristic
  }

  return heuristicResult;
}

export function classifyType(topic: string): DistillationType {
  const lower = topic.toLowerCase().trim();

  if (KNOWN_PERSONS.some((p) => lower.includes(p))) return "person";

  const words = lower.split(/\s+/);
  const isProperName =
    words.length >= 2 &&
    words.length <= 4 &&
    words.every((w) => /^[a-z]/.test(w)) &&
    !lower.includes(" of ") &&
    !lower.includes(" the ") &&
    !lower.includes(" and ");
  const hasNoConceptWords = ![
    "theory", "effect", "principle", "law", "model", "formula",
    "equation", "theorem", "paradox", "hypothesis", "framework",
    "method", "system", "cycle", "revolution", "war", "crisis",
    "age", "era", "empire", "history", "philosophy", "ism",
    "book", "company", "inc", "corp", "technology", "skill",
    "how to", "learn", "vs", "versus", "should",
  ].some((w) => lower.includes(w));
  if (isProperName && hasNoConceptWords && words.length >= 2) return "person";

  const bookSignals = [
    "book", "by ", "novel", "autobiography", "memoir",
    "manifesto", "guide to", "principles by",
    "thinking fast", "sapiens", "atomic habits", "zero to one",
    "poor charlie", "intelligent investor", "art of war",
    "wealth of nations", "black swan", "antifragile",
  ];
  if (bookSignals.some((s) => lower.includes(s))) return "book";

  const companySignals = [
    "company", "inc", "corp", "ltd", "llc", "group",
    "apple", "google", "microsoft", "amazon", "meta",
    "tesla", "nvidia", "netflix", "spotify", "uber",
    "airbnb", "stripe", "shopify", "alibaba", "tencent",
    "bytedance", "samsung", "toyota", "berkshire",
    "goldman sachs", "jpmorgan", "blackrock",
  ];
  if (companySignals.some((s) => lower.includes(s))) return "company";

  const techSignals = [
    "technology", "blockchain", "quantum computing",
    "machine learning", "deep learning", "neural network",
    "crispr", "gene editing", "nuclear fusion",
    "5g", "6g", "api", "protocol", "database",
    "encryption", "compiler", "operating system",
    "cloud computing", "edge computing", "iot",
    "augmented reality", "virtual reality",
    "self-driving", "autonomous",
  ];
  if (techSignals.some((s) => lower.includes(s))) return "technology";

  const skillSignals = [
    "how to", "learn", "skill", "mastery", "practice",
    "technique", "craft of", "art of writing",
    "public speaking", "negotiation", "programming",
    "cooking", "investing", "meditation",
    "speed reading", "critical thinking",
    "problem solving", "leadership skills",
  ];
  if (skillSignals.some((s) => lower.includes(s))) return "skill";

  const questionSignals = [
    "why ", "why do", "why is", "why are", "why does",
    "what is the meaning", "what is the purpose",
    "how does", "how do we", "how can we",
    "is it possible", "can we", "will we ever",
    "what happens when", "what would happen if",
    "what is consciousness", "what is intelligence",
    "what is love", "what is time", "what is life",
    "what is money", "what is truth", "what is art",
    "where do we come from", "are we alone",
    "what is the best way to",
    "?",
  ];
  if (questionSignals.some((s) => lower.includes(s))) return "question";

  const debateSignals = [
    " vs ", "versus", "should we", "is it better",
    "pros and cons", "for or against", "debate",
    "capitalism vs", "nature vs nurture",
    "free will", "gun control", "universal basic income",
    "nuclear energy", "death penalty", "privacy vs security",
    "ai regulation", "crypto regulation",
  ];
  if (debateSignals.some((s) => lower.includes(s))) return "debate";

  const formulaSignals = [
    "formula", "equation", "theorem", "law of", "principle of",
    "algorithm", "=", "²", "σ", "∑", "∫", "π",
    "black-scholes", "pythagor", "euler's", "bayes",
    "e=mc", "f=ma", "pv=nrt",
  ];
  if (formulaSignals.some((s) => lower.includes(s))) return "formula";

  const eventSignals = [
    "crisis", "war", "battle of", "revolution of", "fall of",
    "assassination", "crash of", "disaster", "attack",
    "election", "coup", "treaty of", "bombing",
    "1929", "1945", "1969", "2001", "2008", "9/11",
  ];
  if (eventSignals.some((s) => lower.includes(s))) return "event";

  const historySignals = [
    "history of", "rise of", "age of", "era of", "dynasty",
    "empire", "civilization", "movement", "renaissance",
    "industrial revolution", "enlightenment", "medieval",
    "ancient", "colonial", "cold war",
  ];
  if (historySignals.some((s) => lower.includes(s))) return "history";

  const philosophySignals = [
    "philosophy", "ism", "stoicism", "existentialism", "nihilism",
    "utilitarianism", "pragmatism", "rationalism", "empiricism",
    "ethics of", "school of thought", "doctrine", "metaphysics",
    "epistemology", "ontology", "phenomenology",
  ];
  if (philosophySignals.some((s) => lower.includes(s))) return "philosophy";

  return "concept";
}

export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
  return s || `distill-${Date.now()}`;
}

export async function smartSlugify(text: string): Promise<string> {
  const basic = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");

  if (basic.length >= 3) return basic;

  try {
    const openai = getOpenAI();
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Convert this to a URL-friendly English slug (lowercase, hyphens, no special chars, max 40 chars). Just output the slug, nothing else.\n\nInput: "${text}"`,
      }],
      max_tokens: 30,
      temperature: 0,
    });
    const slug = (res.choices[0]?.message?.content || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 60);
    if (slug.length >= 3) return slug;
  } catch { /* fallback */ }

  return `distill-${Date.now()}`;
}
