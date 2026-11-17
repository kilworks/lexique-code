export type Lang = 'en' | 'fr';

export interface Example { kind: string; lang: string; before: string; after: string }
export interface EnrichSide { why: string; example: Example; pitfall: string }
export interface Enrich { en: EnrichSide; fr: EnrichSide }

export interface Row { word: string; meaning: string; action: string }

export interface Word {
  id: string;
  section: string;
  en: Row;
  fr: Row;
  aliases: { en: string[]; fr: string[] };
  enrich?: Enrich;
}

export interface Section {
  id: string;
  title: { en: string; fr: string };
  kind: 'words' | 'combinations';
  words: string[];
}

export interface Combination {
  id: string;
  en: { phrase: string; result: string };
  fr: { phrase: string; result: string };
  /** word ids, or the raw term when it did not resolve */
  words: string[];
}

export interface Lexicon {
  sections: Section[];
  words: Record<string, Word>;
  combinations: Combination[];
}
