import { tokenize } from "@/lib/data";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "anthropic/claude-sonnet-5";

// Same naive search as memory_store.py: keep every memory that shares at
// least one meaningful word with the question, best-overlap first.
function search(memories: string[], question: string): string[] {
  const questionWords = tokenize(question);
  const scored = memories
    .map((text) => ({ text, overlap: [...tokenize(text)].filter((w) => questionWords.has(w)).length }))
    .filter((m) => m.overlap > 0);
  scored.sort((a, b) => b.overlap - a.overlap);
  return scored.map((m) => m.text);
}

export async function POST(request: Request) {
  const { memories, question, apiKey: clientApiKey } = (await request.json()) as {
    memories: string[];
    question: string;
    apiKey?: string;
  };

  // A key typed into the page takes priority over the server's .env.local,
  // so teammates can use their own key without needing to touch any files.
  const apiKey = clientApiKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "No API key available. Paste your OpenRouter key into the field on this page, or set OPENROUTER_API_KEY in .env.local.",
      },
      { status: 500 }
    );
  }

  const retrieved = search(memories, question);

  const systemPrompt =
    retrieved.length > 0
      ? "You are an assistant with access to saved memories about this user. Use ONLY the memories below to answer. If the memories don't answer the question, say you don't have that saved rather than guessing.\n\nSaved memories:\n" +
        retrieved.map((m) => `- ${m}`).join("\n")
      : "You are an assistant with access to saved memories about this user. No memories are saved for this user yet. If the question depends on saved information, say you don't have that saved rather than guessing.";

  const requestBody = {
    model: MODEL,
    temperature: 0,
    max_tokens: 300,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
  };

  const started = Date.now();
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });
  const responseBody = await res.json();
  const elapsedMs = Date.now() - started;

  return Response.json({
    retrieved,
    requestBody,
    responseBody,
    answer: responseBody?.choices?.[0]?.message?.content ?? null,
    elapsedMs,
    ok: res.ok,
  });
}
