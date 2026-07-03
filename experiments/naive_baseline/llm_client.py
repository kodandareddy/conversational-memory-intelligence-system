"""
Thin wrapper around the OpenRouter API. Reads the API key from the environment
only - never hardcode a key here, and never commit one.
"""

import os
import requests

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Fixed model + temperature, recorded here so results are reproducible and the
# exact model used is easy to report in the write-up.
MODEL = "anthropic/claude-sonnet-5"
TEMPERATURE = 0
MAX_TOKENS = 300  # these are short factual answers; also avoids OpenRouter
                   # reserving its huge default max against your credit balance


def ask(question, memories):
    """Send the question to the model with whatever memories were retrieved
    (possibly none). Returns (answer_text, usage_dict)."""
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY is not set. Run: export OPENROUTER_API_KEY=your-key"
        )

    if memories:
        context = "\n".join(f"- {m}" for m in memories)
        system_prompt = (
            "You are an assistant with access to saved memories about this user. "
            "Use ONLY the memories below to answer. If the memories don't answer "
            "the question, say you don't have that saved rather than guessing.\n\n"
            f"Saved memories:\n{context}"
        )
    else:
        system_prompt = (
            "You are an assistant with access to saved memories about this user. "
            "No memories are saved for this user yet. If the question depends on "
            "saved information, say you don't have that saved rather than guessing."
        )

    response = requests.post(
        OPENROUTER_URL,
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": MODEL,
            "temperature": TEMPERATURE,
            "max_tokens": MAX_TOKENS,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question},
            ],
        },
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    answer = data["choices"][0]["message"]["content"]
    usage = data.get("usage", {})
    return answer, usage