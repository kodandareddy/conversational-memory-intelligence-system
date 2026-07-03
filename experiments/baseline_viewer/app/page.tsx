import { loadMergedCases, tokenize, type MergedCase } from "@/lib/data";

function HighlightedMemory({ text, question }: { text: string; question: string }) {
  const matchWords = tokenize(question);
  const parts = text.split(/(\s+)/); // keep whitespace so words rejoin cleanly

  return (
    <span>
      {parts.map((part, i) => {
        const cleaned = part.toLowerCase().replace(/[^a-z0-9']/g, "");
        const isMatch = cleaned.length > 0 && matchWords.has(cleaned);
        return isMatch ? (
          <mark key={i} className="bg-yellow-200 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
}

function CaseCard({ c }: { c: MergedCase }) {
  const retrieved = c.result?.retrieved_memories ?? [];
  const wasRetrievedFromSetup = new Set(retrieved);

  return (
    <div className="border rounded-lg p-5 mb-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">
          Case {c.id} <span className="text-gray-500 font-normal">— {c.category}</span>
        </h2>
        {c.context_char_limit && (
          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
            budget limit: {c.context_char_limit} chars
          </span>
        )}
      </div>

      <div className="mb-3">
        <div className="text-sm font-medium text-gray-500 mb-1">
          What the user said before (setup):
        </div>
        <ul className="text-sm space-y-1">
          {c.setup.length === 0 && <li className="italic text-gray-400">(nothing - cold start)</li>}
          {c.setup.map((s, i) => (
            <li key={i} className={wasRetrievedFromSetup.has(s) ? "" : "text-gray-400"}>
              {wasRetrievedFromSetup.has(s) ? "✅ kept" : "⬜ ignored"} — {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-3">
        <div className="text-sm font-medium text-gray-500 mb-1">Question asked:</div>
        <div className="text-sm font-medium">{c.question}</div>
      </div>

      <div className="mb-3">
        <div className="text-sm font-medium text-gray-500 mb-1">
          What the naive search actually retrieved (matching words highlighted):
        </div>
        {retrieved.length === 0 ? (
          <div className="text-sm italic text-gray-400">(nothing retrieved)</div>
        ) : (
          <ul className="text-sm space-y-1">
            {retrieved.map((r, i) => (
              <li key={i} className="bg-gray-50 rounded px-2 py-1">
                <HighlightedMemory text={r} question={c.question} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded p-3">
          <div className="text-xs font-semibold text-blue-800 mb-1">Claude&apos;s actual answer</div>
          <div className="text-sm text-blue-900">
            {c.result?.answer ?? "(not run yet)"}
          </div>
        </div>
        <div className="bg-green-50 rounded p-3">
          <div className="text-xs font-semibold text-green-800 mb-1">Expected / correct answer</div>
          <div className="text-sm text-green-900">{c.expected}</div>
        </div>
      </div>

      {c.result && (
        <div className="text-xs text-gray-400 mt-3">
          retrieval: {c.result.retrieval_ms}ms · total: {c.result.total_ms}ms · prompt tokens:{" "}
          {c.result.prompt_tokens ?? "n/a"}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const cases = loadMergedCases();

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">Deliverable 3 — Naive Baseline Viewer</h1>
      <p className="text-gray-600 mb-4 text-sm">
        A visual replay of the 10 test cases. This reads the same data the Python script
        produced (<code>cases.json</code> and <code>error_examples.jsonl</code>) — it doesn&apos;t
        call the AI itself.
      </p>
      <a href="/try" className="inline-block mb-8 text-sm text-blue-600 underline">
        Try it yourself with a live API call →
      </a>
      {cases.map((c) => (
        <CaseCard key={c.id} c={c} />
      ))}
    </main>
  );
}
