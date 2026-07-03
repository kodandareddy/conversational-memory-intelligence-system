import fs from "fs";
import path from "path";

// Same stopword list and word-splitting rule as memory_store.py, so the
// highlighting in the UI matches exactly what the Python search actually did.
const STOPWORDS = new Set([
  "a", "an", "the", "i", "you", "he", "she", "it", "we", "they",
  "is", "am", "are", "was", "were", "be", "been", "being",
  "my", "your", "his", "her", "its", "our", "their",
  "to", "of", "in", "on", "at", "for", "with", "about", "again",
  "what", "who", "did", "do", "does", "so", "that", "this",
]);

export function tokenize(text: string): Set<string> {
  const words = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  return new Set(words.filter((w) => !STOPWORDS.has(w)));
}

export interface CaseData {
  id: number;
  category: string;
  user_id: string;
  setup: string[];
  question: string;
  expected: string;
  context_char_limit?: number;
}

export interface ResultData {
  id: number;
  category: string;
  question: string;
  retrieved_memories: string[];
  answer: string;
  expected: string;
  retrieval_ms: number;
  total_ms: number;
  prompt_tokens: number | null;
  completion_tokens: number | null;
}

export interface MergedCase extends CaseData {
  result?: ResultData;
}

// Reads the two files the Python side already produced - no duplication,
// this project has no data of its own.
export function loadMergedCases(): MergedCase[] {
  const experimentsDir = path.join(process.cwd(), "..");
  const casesPath = path.join(experimentsDir, "naive_baseline", "cases.json");
  const resultsPath = path.join(experimentsDir, "error_examples.jsonl");

  const cases: CaseData[] = JSON.parse(fs.readFileSync(casesPath, "utf-8"));

  let results: ResultData[] = [];
  if (fs.existsSync(resultsPath)) {
    results = fs
      .readFileSync(resultsPath, "utf-8")
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line));
  }

  const resultsById = new Map(results.map((r) => [r.id, r]));

  return cases.map((c) => ({
    ...c,
    result: resultsById.get(c.id),
  }));
}
