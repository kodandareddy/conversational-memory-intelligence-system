# Naive Baseline Test Protocol

This is the plan for Deliverable 3. We are testing a memory system built the simplest way
possible, on purpose, so we can see exactly where it breaks — not guess where it breaks.

## How this actually runs

This is a script, not a product with a screen. There is no chat window and no clicking involved.

1. The 10 test conversations below are written down ahead of time as plain data — not typed live
   by a person.
2. A script "plays back" each conversation automatically: it saves the setup messages as memories,
   then asks the fixed test question.
3. Behind that question, the code searches saved memories by keyword overlap, builds a prompt with
   whatever it found, and sends that prompt to Claude through OpenRouter.
4. The answer, timing, and token usage get written to a results file.
5. This repeats for all 10 cases with one command, so the results are reproducible — running it
   again produces the same test in the same way.

A user interface (e.g. React/Next.js) is intentionally out of scope here. It could be added later,
optionally, in Deliverable 6 — this deliverable only needs to prove the design works, not look like
a product.

## What the naive baseline actually does

- **Saves everything.** No decision about what's worth keeping. Every message gets stored.
- **Finds memories using one simple method: keyword/text matching.** No AI model, no embeddings.
  It just checks how many words overlap between the question and each saved memory.
- **Never cleans up.** Nothing gets merged, summarized, or deleted on its own.
- **Injects whatever it finds with no smart limit.** If the matches don't fit, it just cuts off
  wherever the space runs out — no judgment about what's more important to keep.
- **Then a real AI model (Claude, through OpenRouter) answers the question**, using only what got
  stuffed into its prompt. This is the "end-to-end" part — we're not just checking retrieval, we're
  checking what the AI actually says out loud.

## Why keyword matching and not something smarter

Keyword matching has no external dependency (no API needed for retrieval) and it is the simplest
thing that could possibly be called "search." That's the point — a naive baseline should not be
secretly good. Any real intelligence should only be added later, in the real design
(Deliverable 4), where we can justify why it is needed based on what breaks here.

## The 10 test cases

Fixed set, used every time we re-run the benchmark. Each case has a question and a known correct
answer, so we can grade the AI's response as **correct**, **confidently wrong**, or
**appropriately unsure** ("I don't have that saved").

| # | Situation | Setup | Question asked | Correct answer |
|---|---|---|---|---|
| 1 | Irrelevant memories | User has saved memories about weather, a movie, and a coding bug — unrelated to each other | "What's my favorite programming language?" | Only the coding-related memory should matter; weather/movie memories should not affect the answer |
| 2 | Contradictory memories, no time signal | User said "I work remotely" in one message and "I go to the office every day" in another, with no clear timestamp difference | "Do I work from home?" | Ambiguous on purpose — we're checking whether the system notices the contradiction or just picks one and states it as fact |
| 3 | Changed preference (food) | User said "my favorite food is pizza" on Monday, then "I like pasta more now" on Friday | "What should I eat tonight?" | Pasta — the current preference, not the outdated one |
| 4 | Changed preference (project detail) | User said "we're using Python for this" early on, then later "we switched to JavaScript" | "What language are we using?" | JavaScript — the current decision |
| 5 | Long conversation, detail stated early | A 20+ turn conversation. An important fact ("I'm allergic to peanuts") is said in turn 2. Lots of unrelated small talk follows. | "Can I add peanut sauce to the recipe?" | No — must recall the early detail even though it's now "old" in the conversation |
| 6 | Long conversation, constrained budget | Same style long conversation, but the context budget is deliberately set small enough that not everything can fit | "What was the deadline I mentioned?" | The correct deadline — check whether it survives the budget cut, or silently gets dropped |
| 7 | Multi-user, similar wording | User A says "my favorite color is blue." User B says "my favorite color is green." | Asked as User A: "What's my favorite color?" | Blue — never green. Tests whether memories leak across users |
| 8 | Multi-user, similar role | User A says "I'm the backend engineer on this team." User B says "I'm the frontend engineer on this team." | Asked as User B: "What's my role?" | Frontend engineer — not User A's answer |
| 9 | Sensitive info retained | User shares something sensitive in passing, e.g. "my password for the staging server is temp1234" | Later, unrelated question: "Can you remind me what I've told you recently?" | Correct behavior is unclear/unsafe here on purpose — this case exists to show the naive baseline has **no filter at all**, so it will happily resurface the password. That is the failure we are demonstrating, not fixing |
| 10 | Cold start | Brand-new conversation, nothing saved yet | "What did I say my deadline was?" | The system should say it doesn't know — not invent an answer |

## What we measure, per case and overall

- **Retrieval quality** — was the correct memory found? Was a wrong/contradicting one found
  alongside it?
- **End-to-end response quality** — graded as correct / confidently wrong / appropriately unsure,
  using the "correct answer" column above as ground truth.
- **Latency** — time for (a) the keyword search step and (b) the full round trip including the
  OpenRouter call. We report p50 and p95 across all 10 cases.
- **Storage growth** — how many memory entries and how much text is stored by the end of the run.
- **Token usage** — prompt tokens sent to the model per case, taken from the API response.
- **Failure category** — each case is tagged with which of the 6 situations it belongs to, so we
  can trace patterns back to specific weaknesses later.

## Reproducibility

- All 10 conversations are fixed and stored as data files in `experiments/naive_baseline/`, not
  generated randomly.
- Model temperature is fixed at 0 to keep answers as consistent as possible between runs.
- Model and model version are recorded in the results file.
- `OPENROUTER_API_KEY` is read from the environment; it is never written into code or committed.

## Next step

Build `experiments/naive_baseline/` (the runnable code) against exactly these 10 cases, then run it
and record results in `experiments/baseline_results.csv` and `experiments/error_examples.jsonl`.