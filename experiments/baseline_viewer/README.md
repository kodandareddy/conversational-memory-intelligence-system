# Baseline Viewer

A supplementary tool for understanding Deliverable 3 (`../naive_baseline/`) visually. This is
**not** a required deliverable artifact — it's a learning aid on top of the actual required files
(`../baseline_results.csv`, `../error_examples.jsonl`).

Two pages:

- **`/`** — a replay of the 10 fixed test cases already run, showing what was retrieved from
  memory (with matching words highlighted) and the real answer Claude gave, next to the expected
  correct answer.
- **`/try`** — a live page where you can type your own memories and question, and watch a real
  request go out to OpenRouter and the real response come back, including the raw JSON of both.

## Prerequisite: run the Python side first

This app reads data that Python produces - it doesn't generate any test data itself.

```bash
cd ../naive_baseline
pip install -r requirements.txt
python3 export_cases.py          # writes cases.json - needed for both pages
export OPENROUTER_API_KEY="your-key"
python3 run_baseline.py          # writes baseline_results.csv and error_examples.jsonl
```

If you only run `export_cases.py` (skip the actual baseline run), the `/` page will still show all
10 cases, just with "(not run yet)" instead of real answers.

## Setup

Requires Node.js.

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the replay viewer, or http://localhost:3000/try for the live page.

## Using the live `/try` page

You need an OpenRouter API key (get one at https://openrouter.ai/settings/keys). Two ways to
provide it:

1. **Paste it into the "Your OpenRouter API key" field on the `/try` page itself.** This is the
   easiest option if you're just trying this out - the key is saved only in your own browser
   (`localStorage`), never written to any file, and only sent to this app's own server, which
   forwards it to OpenRouter for that one request.
2. **Or set it once as an environment variable for the whole app**, by creating a `.env.local`
   file in this folder (already gitignored):
   ```
   OPENROUTER_API_KEY=your-key-here
   ```
   A key typed into the page takes priority over this if both are set.

Each request on `/try` costs a small amount on your OpenRouter account (a fraction of a cent per
try).