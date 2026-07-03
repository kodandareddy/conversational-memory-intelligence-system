"""
Exports CASES from fixtures.py to plain JSON, so other tools (like the
baseline viewer) can read the test data without needing Python or calling
the API again.
"""

import json
from pathlib import Path

from fixtures import CASES

OUTPUT = Path(__file__).resolve().parent / "cases.json"

with open(OUTPUT, "w") as f:
    json.dump(CASES, f, indent=2)

print(f"Wrote {len(CASES)} cases to {OUTPUT}")