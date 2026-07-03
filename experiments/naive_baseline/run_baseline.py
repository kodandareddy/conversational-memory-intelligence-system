"""
Runs all 10 fixed cases from fixtures.py against the naive memory store and a
real Claude model (via OpenRouter), then writes results to:

  - experiments/baseline_results.csv   (one row per case, for quick scanning)
  - experiments/error_examples.jsonl   (full detail per case, including what
                                         was actually retrieved, for writing up
                                         the failure report)

Usage:
  export OPENROUTER_API_KEY=your-key
  cd experiments/naive_baseline
  python run_baseline.py
"""

import csv
import json
import statistics
import time
from pathlib import Path

from fixtures import CASES
from llm_client import ask, MODEL
from memory_store import MemoryStore

EXPERIMENTS_DIR = Path(__file__).resolve().parent.parent
RESULTS_CSV = EXPERIMENTS_DIR / "baseline_results.csv"
ERROR_JSONL = EXPERIMENTS_DIR / "error_examples.jsonl"


def run_case(case, store):
    for text in case.get("setup", []):
        store.save(case["user_id"], text)

    max_chars = case.get("context_char_limit")

    t0 = time.perf_counter()
    retrieved = store.search(case["user_id"], case["question"], max_chars=max_chars)
    retrieval_ms = (time.perf_counter() - t0) * 1000

    t0 = time.perf_counter()
    answer, usage = ask(case["question"], retrieved)
    llm_ms = (time.perf_counter() - t0) * 1000

    return {
        "id": case["id"],
        "category": case["category"],
        "question": case["question"],
        "retrieved_memories": retrieved,
        "answer": answer.strip(),
        "expected": case["expected"],
        "retrieval_ms": round(retrieval_ms, 2),
        "total_ms": round(retrieval_ms + llm_ms, 2),
        "prompt_tokens": usage.get("prompt_tokens"),
        "completion_tokens": usage.get("completion_tokens"),
    }


def main():
    store = MemoryStore()
    results = []

    for case in CASES:
        print(f"Running case {case['id']} ({case['category']})...")
        result = run_case(case, store)
        results.append(result)
        print(f"  answer: {result['answer'][:100]!r}")

    total_memories = store.all_memories()
    total_chars = sum(len(m) for m in total_memories)

    latencies = [r["total_ms"] for r in results]
    p50 = statistics.median(latencies)
    p95 = (
        statistics.quantiles(latencies, n=20)[18]
        if len(latencies) >= 2
        else latencies[0]
    )

    with open(RESULTS_CSV, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "id",
                "category",
                "question",
                "answer",
                "expected",
                "retrieval_ms",
                "total_ms",
                "prompt_tokens",
                "completion_tokens",
            ]
        )
        for r in results:
            writer.writerow(
                [
                    r["id"],
                    r["category"],
                    r["question"],
                    r["answer"],
                    r["expected"],
                    r["retrieval_ms"],
                    r["total_ms"],
                    r["prompt_tokens"],
                    r["completion_tokens"],
                ]
            )

    with open(ERROR_JSONL, "w") as f:
        for r in results:
            f.write(json.dumps(r) + "\n")

    print("\n--- Summary ---")
    print(f"Model: {MODEL}")
    print(f"Cases run: {len(results)}")
    print(f"Total memories stored: {len(total_memories)} ({total_chars} characters)")
    print(f"Latency p50: {p50:.1f} ms | p95: {p95:.1f} ms")
    print(f"Results written to: {RESULTS_CSV}")
    print(f"Full records written to: {ERROR_JSONL}")
    print(
        "\nNext: read through error_examples.jsonl and grade each answer as "
        "correct / confidently wrong / appropriately unsure, using the "
        "'expected' field as ground truth. That grading is what goes into "
        "productive_failure_report.pdf."
    )


if __name__ == "__main__":
    main()