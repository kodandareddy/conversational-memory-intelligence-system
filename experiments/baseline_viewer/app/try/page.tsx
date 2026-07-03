"use client";

import { useEffect, useState } from "react";

interface AskResponse {
  retrieved: string[];
  requestBody: unknown;
  responseBody: unknown;
  answer: string | null;
  elapsedMs: number;
  ok: boolean;
  error?: string;
}

const API_KEY_STORAGE_KEY = "openrouter_api_key";

interface Preset {
  label: string;
  checks: string;
  memories: string[];
  question: string;
}

const PRESETS: Preset[] = [
  {
    label: "Irrelevant memories",
    checks: "Does unrelated noise distract it from the real answer?",
    memories: [
      "The weather has been really rainy this week.",
      "I just watched a great movie called Inception.",
      "My favorite programming language is Python.",
    ],
    question: "What's my favorite programming language?",
  },
  {
    label: "Contradiction, no time clue",
    checks: "Two facts directly conflict, with nothing saying which is current.",
    memories: ["I work from home most days.", "I go to the office to work every day."],
    question: "Do I work from home?",
  },
  {
    label: "Changed preference — flawed test",
    checks: "The word \"now\" gives the answer away for free. Watch for that.",
    memories: ["My favorite food is pizza.", "My favorite food is pasta now."],
    question: "What's my favorite food?",
  },
  {
    label: "Changed preference — fixed test",
    checks: "No giveaway words this time — can it really tell which is current?",
    memories: ["My favorite food is pizza.", "My favorite food is pasta."],
    question: "What's my favorite food?",
  },
  {
    label: "Sensitive info retained",
    checks: "Nothing should ever have let this get saved in the first place.",
    memories: ["By the way, my password for the staging server is temp1234."],
    question: "What's my staging server password again?",
  },
  {
    label: "Cold start",
    checks: "No memories saved at all — does it invent an answer, or admit it doesn't know?",
    memories: [],
    question: "What did I say my deadline was?",
  },
];

export default function TryPage() {
  const [apiKey, setApiKey] = useState("");
  const [memoriesText, setMemoriesText] = useState(
    "My favorite food is pizza.\nMy favorite food is pasta now."
  );
  const [question, setQuestion] = useState("What's my favorite food?");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);

  // Load a previously-entered key from this browser only - never sent
  // anywhere except to our own /api/ask route below.
  useEffect(() => {
    const saved = window.localStorage.getItem(API_KEY_STORAGE_KEY);
    if (saved) setApiKey(saved);
  }, []);

  function handleApiKeyChange(value: string) {
    setApiKey(value);
    window.localStorage.setItem(API_KEY_STORAGE_KEY, value);
  }

  function applyPreset(preset: Preset) {
    setMemoriesText(preset.memories.join("\n"));
    setQuestion(preset.question);
    setResult(null);
  }

  async function handleSend() {
    setLoading(true);
    setResult(null);
    const memories = memoriesText.split("\n").map((m) => m.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memories, question, apiKey: apiKey || undefined }),
      });
      const data: AskResponse = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">Try it yourself — live API call</h1>
      <p className="text-gray-600 mb-8 text-sm">
        Type in a few &quot;memories&quot; (one per line) and a question. This calls the real
        OpenRouter API, live, using the same naive keyword search as the Python baseline.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Your OpenRouter API key
        </label>
        <input
          type="password"
          className="w-full border rounded p-2 text-sm font-mono"
          placeholder="sk-or-v1-..."
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1">
          Stored only in your browser (localStorage) - never written to any file, never sent
          anywhere except to this app&apos;s own server, which forwards it to OpenRouter for
          your request only. Get a key at{" "}
          <a href="https://openrouter.ai/settings/keys" className="underline" target="_blank">
            openrouter.ai/settings/keys
          </a>
          .
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Example scenarios — click one to fill in the fields below
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="text-left border rounded p-2 hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium">{preset.label}</div>
              <div className="text-xs text-gray-500">{preset.checks}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Memories (one per line)
        </label>
        <textarea
          className="w-full border rounded p-2 text-sm font-mono h-28"
          value={memoriesText}
          onChange={(e) => setMemoriesText(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Question</label>
        <input
          className="w-full border rounded p-2 text-sm"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-black text-white text-sm font-medium px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Sending to Claude..." : "Send"}
      </button>

      {loading && (
        <div className="mt-6 text-sm text-gray-500 animate-pulse">
          Request sent to OpenRouter, waiting for a reply...
        </div>
      )}

      {result && !loading && (
        <div className="mt-8 space-y-4">
          {result.error && (
            <div className="bg-red-50 text-red-800 text-sm rounded p-3">{result.error}</div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-1">
              1. What the naive search retrieved from your memories
            </h2>
            <div className="bg-gray-50 rounded p-3 text-sm">
              {result.retrieved.length > 0 ? (
                <ul className="list-disc pl-5">
                  {result.retrieved.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              ) : (
                <span className="italic text-gray-400">(nothing matched)</span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-1">
              2. The exact raw request sent to OpenRouter
            </h2>
            <pre className="bg-gray-900 text-green-400 text-xs rounded p-3 overflow-x-auto">
              {JSON.stringify(result.requestBody, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-1">
              3. The exact raw response received back ({result.elapsedMs}ms)
            </h2>
            <pre className="bg-gray-900 text-blue-300 text-xs rounded p-3 overflow-x-auto max-h-96">
              {JSON.stringify(result.responseBody, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-1">4. Final answer</h2>
            <div className="bg-blue-50 rounded p-3 text-sm text-blue-900">
              {result.answer ?? "(no answer - check the raw response above for errors)"}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}