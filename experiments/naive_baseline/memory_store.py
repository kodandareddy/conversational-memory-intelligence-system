"""
The naive memory store: saves everything, finds things by plain keyword overlap,
never cleans up, and cuts off with no smart trimming once a character budget is hit.
"""

import re
from collections import defaultdict

# Even the simplest keyword search usually drops ultra-common words, or every
# sentence "matches" every question through words like "the" and "i" alone.
# This is still naive - no stemming, no synonyms, no semantics - just a
# slightly less noisy version of literal word overlap.
STOPWORDS = {
    "a", "an", "the", "i", "you", "he", "she", "it", "we", "they",
    "is", "am", "are", "was", "were", "be", "been", "being",
    "my", "your", "his", "her", "its", "our", "their",
    "to", "of", "in", "on", "at", "for", "with", "about", "again",
    "what", "who", "did", "do", "does", "so", "that", "this",
}


def tokenize(text):
    """Break text into lowercase words, dropping stopwords."""
    words = re.findall(r"[a-z0-9']+", text.lower())
    return {w for w in words if w not in STOPWORDS}


class MemoryStore:
    def __init__(self):
        self._memories = defaultdict(list)  # user_id -> list of saved memory strings

    def save(self, user_id, text):
        self._memories[user_id].append(text)

    def all_memories(self):
        """Every memory, for every user - used to measure storage growth."""
        return [text for texts in self._memories.values() for text in texts]

    def search(self, user_id, query, max_chars=None):
        """Return this user's memories that share at least one word with the
        query, ranked by how many words overlap. Ties keep the order the
        memories were originally saved in (no smarter tie-breaking).

        If max_chars is set, memories are added in ranked order until the
        next one would not fit, then the search stops - no attempt is made
        to swap in a smaller, lower-ranked memory instead."""
        query_words = tokenize(query)

        scored = []
        for text in self._memories[user_id]:
            overlap = len(query_words & tokenize(text))
            if overlap > 0:
                scored.append((overlap, text))

        # stable sort: equal-overlap memories keep their original save order
        scored.sort(key=lambda pair: pair[0], reverse=True)
        results = [text for _, text in scored]

        if max_chars is None:
            return results

        budget_results = []
        used_chars = 0
        for text in results:
            if used_chars + len(text) > max_chars:
                break  # naive: stop as soon as the next memory doesn't fit
            budget_results.append(text)
            used_chars += len(text)
        return budget_results