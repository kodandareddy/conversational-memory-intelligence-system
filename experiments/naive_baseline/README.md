# Naive Baseline (Deliverable 3)

The simplest possible working memory system, built on purpose to measure exactly where and how
it fails. See `../baseline_protocol.md` for the full plan and the 10 test cases.

## What's in this folder

- `fixtures.py` — the 10 fixed test cases (setup messages, question, correct answer).
- `memory_store.py` — the "dumb" search: saves everything, finds memories by plain keyword
  overlap, no smart trimming.
- `llm_client.py` — sends the retrieved memories + question to Claude, via OpenRouter.
- `run_baseline.py` — runs all 10 cases and writes the results.
- `export_cases.py` — exports the test cases to `cases.json`, so non-Python tools (like the
  `../baseline_viewer/` Next.js app) can read the same test data.

## Setup

Requires Python 3.

```bash
cd experiments/naive_baseline
pip install -r requirements.txt
```

You need an OpenRouter API key (get one at https://openrouter.ai/settings/keys). Set it as an
environment variable — **never write it into any file in this repo**:

```bash
export OPENROUTER_API_KEY="your-key-here"
```

## Running it

```bash
python3 run_baseline.py
```

This runs all 10 cases against a real Claude model and writes:

- `../baseline_results.csv` — one row per case (question, answer, timing, tokens).
- `../error_examples.jsonl` — full detail per case, including exactly what got retrieved from
  memory. This is what the failure report and the baseline viewer both read.

Each run costs a small amount on your OpenRouter account (roughly a few cents for all 10 cases).

## Regenerating the JSON export for the viewer

If you change anything in `fixtures.py`, re-run this so the viewer picks up the change:

```bash
python3 export_cases.py
```

This just writes `cases.json` - it does not call the API and costs nothing.