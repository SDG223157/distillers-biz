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
  };

  return `TOPIC: "${topic}"
TYPE: ${type}

${typeInstructions[type]}

RESEARCH MATERIAL:
${researchText}

Return a JSON object with this exact structure:
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
  ]
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
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(topic, type, researchText) },
    ],
    temperature: 0.7,
    max_tokens: 8000,
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

export function classifyType(topic: string): DistillationType {
  const lower = topic.toLowerCase();

  const formulaSignals = [
    "formula", "equation", "theorem", "law of", "principle of",
    "algorithm", "=", "²", "σ", "∑", "∫", "π",
    "black-scholes", "pythagor", "euler", "bayes", "newton",
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
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}
