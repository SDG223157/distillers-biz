export type DistillationType =
  | "concept"
  | "formula"
  | "event"
  | "history"
  | "philosophy"
  | "person"
  | "book"
  | "company"
  | "technology"
  | "skill"
  | "debate";

export type DistillationStatus =
  | "researching"
  | "distilling"
  | "complete"
  | "failed";

export interface Distillation {
  id: number;
  slug: string;
  title: string;
  type: DistillationType;
  subtitle: string | null;
  status: DistillationStatus;
  essence: string | null;
  content: DistillationContent | null;
  sources: SourceEntry[];
  research_queries: string[];
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface DistillationContent {
  essence: string;
  origin_story: string;
  sections: ContentSection[];
  key_principles: Principle[];
  applications: Application[];
  limitations: string[];
  misconceptions: string[];
  connections: Connection[];
  key_figures: Figure[];
  timeline: TimelineEntry[];
  quotes: Quote[];
  mental_models?: MentalModel[];
  decision_heuristics?: DecisionHeuristic[];
  expression_dna?: ExpressionDNA;
  values_and_antipatterns?: ValuesAntipatterns;
  intellectual_lineage?: string;
}

export interface MentalModel {
  name: string;
  one_line: string;
  evidence: string[];
  application: string;
  limitation: string;
}

export interface DecisionHeuristic {
  rule: string;
  description: string;
  example: string;
}

export interface ExpressionDNA {
  sentence_style: string;
  vocabulary: string;
  rhythm: string;
  humor: string;
  certainty: string;
  catchphrases: string[];
}

export interface ValuesAntipatterns {
  values: string[];
  antipatterns: string[];
  tensions: string[];
}

export interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: "text" | "timeline" | "principles" | "formula" | "comparison";
}

export interface Principle {
  name: string;
  description: string;
  example: string;
}

export interface Application {
  domain: string;
  description: string;
  example: string;
}

export interface Connection {
  title: string;
  relation: string;
  slug?: string;
}

export interface Figure {
  name: string;
  role: string;
  contribution: string;
}

export interface TimelineEntry {
  date: string;
  event: string;
  significance: string;
}

export interface Quote {
  text: string;
  attribution: string;
}

export interface SourceEntry {
  title: string;
  url: string;
  snippet: string;
}

export const TYPE_META: Record<
  DistillationType,
  { label: string; icon: string; color: string; description: string }
> = {
  concept: {
    label: "Concept",
    icon: "💡",
    color: "amber",
    description: "Ideas, frameworks, mental models",
  },
  formula: {
    label: "Formula",
    icon: "∑",
    color: "blue",
    description: "Equations, theorems, algorithms",
  },
  event: {
    label: "Event",
    icon: "⚡",
    color: "red",
    description: "Historical events, crises, breakthroughs",
  },
  history: {
    label: "History",
    icon: "📜",
    color: "emerald",
    description: "Eras, movements, civilizations",
  },
  philosophy: {
    label: "Philosophy",
    icon: "🏛️",
    color: "purple",
    description: "Schools of thought, doctrines, worldviews",
  },
  person: {
    label: "Person",
    icon: "🧠",
    color: "cyan",
    description: "Thinkers, leaders, innovators — distill how they think",
  },
  book: {
    label: "Book",
    icon: "📖",
    color: "orange",
    description: "Core thesis, key arguments, actionable takeaways",
  },
  company: {
    label: "Company",
    icon: "🏢",
    color: "sky",
    description: "Business model, moat, culture, strategy",
  },
  technology: {
    label: "Technology",
    icon: "⚙️",
    color: "teal",
    description: "How it works, evolution, applications, future",
  },
  skill: {
    label: "Skill",
    icon: "🎯",
    color: "lime",
    description: "How to learn it, techniques, mastery path",
  },
  debate: {
    label: "Debate",
    icon: "⚖️",
    color: "rose",
    description: "Both sides, strongest arguments, evidence, verdict",
  },
};
