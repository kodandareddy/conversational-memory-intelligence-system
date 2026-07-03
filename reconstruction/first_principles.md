# What the Real System Must Do

This is Step 4. Below is the list of things the real memory system
has to be able to do. None of this is a wish list. Every item exists
because one specific simple approach, from `failure_analysis.md`,
broke without it.

Each item is written the same simple way: what failure it came from,
and what the system needs because of it.

---

## 1. Remember things across separate chats

**Came from:** Approach 1, no memory at all. People had to repeat
themselves every single time, because the AI forgot everything the
moment a chat ended.

**What's needed:** The system has to save something said in one
chat, and bring it back later, even in a completely different chat.

---

## 2. Only bring back what's actually needed, not everything

**Came from:** Approach 2, sending the whole conversation back every
time. This got slow and expensive, and it eventually ran into a hard
limit on how much text the AI can read at once.

**What's needed:** The system has to pick out just the small number
of memories that matter for the current question, instead of reading
everything it has ever saved.

---

## 3. Keep exact facts, not fuzzy summaries

**Came from:** Approach 3, summarizing old messages. Summaries
quietly dropped specific details, like numbers, names, or one-time
rules, with no way to get them back.

**What's needed:** The system has to keep the exact original fact
somewhere, not just a squashed-down summary of it. Summaries can
still be useful, but they cannot be the only copy of something
important.

---

## 4. Decide what to keep based on importance, not just how recent it is

**Came from:** Approach 4, keeping only the last few messages.
Something important said early in a chat got thrown away just as
fast as a one-time "thanks," purely because both were old.

**What's needed:** The system needs a way to judge how important a
fact is, separate from how long ago it was said. An old but
important fact should survive. A recent but throwaway comment does
not need to.

---

## 5. Have a clear rule for what's worth saving, and stay fast as it grows

**Came from:** Approach 5, the separate notes file. There was no
clear rule for what counted as important enough to save, so the file
filled up with noise, missed things that mattered, and became slow
and expensive to read as it grew into the thousands of entries.

**What's needed:** The system needs a real, consistent rule for
deciding what deserves to be saved in the first place, instead of
saving everything and hoping for the best. It also has to stay fast
and cheap to check, even after months of heavy use.

---

## 6. Know which memory is still true, and be able to fix or delete a wrong one

**Came from:** Approach 6, searching for related facts. The system
could find facts that sounded related, but it could not tell an old,
replaced fact, like "I like pizza," from the new one that replaced
it, "I like pasta now." Once a fact was wrong, there was no way to
correct or remove it.

**What's needed:** The system has to tell when a new fact replaces an
old one, and it has to allow a wrong or outdated memory to be
corrected or deleted, instead of letting it sit there forever next to
the correct one.

---

## 7. Keep different people's memories separate

**Came from:** the multi-user privacy example in
`problem_reconstruction.pdf`, where Employee A's salary almost
reached Employee B, and the multi-user isolation constraint.

**What's needed:** The system always has to know whose memory
belongs to whom. One person's saved information must never leak into
someone else's conversation, even if their questions sound similar.

---

## Open Questions (Step 5)

These are not answered yet. They are genuinely unresolved, and the
design phase still has to work them out.

1. **How do we decide what is worth remembering and what is not?**
   Approach 5 showed there is no clear rule for deciding what is
   important enough to save. We know the system needs a rule
   (capability 5), but we have not said what that rule actually is.

2. **How does the system know when a new fact replaces an old one,
   versus both being true at the same time?**
   Approach 6 showed the system could not tell "I like pizza" and "I
   like pasta now" apart. Is one replacing the other, or are both
   still true? We know the system needs to handle this (capability
   6), but not yet how it would decide.
