# Simple Approaches and Why Each One Fails

This is Step 3. We look at simple ways to give an AI a memory. For
each one, we write down what it assumed would always be true, and a
real example of that going wrong.

There are six approaches here, more than the three the assignment
asks for. All six already show up together in `historical_timeline.pdf`
as one connected story. Here, each one is pulled out on its own so we
can look at just its assumption and just its failure.

---

## Approach 1: No memory at all

**What it assumed:** A chat stands on its own. A person will never
need the AI to remember anything from an earlier chat.

**How it actually failed:** OpenAI's GPT-3 API treated every message
like the very first one, even a second after the last message. If a
developer wanted the AI to remember something, they had to copy the
old messages themselves and paste them back in. When ChatGPT first
launched, every "New Chat" started completely blank too. So many
people complained about this that it took OpenAI over a year to add
a real memory feature.

---

## Approach 2: Send the whole conversation back every time

**What it assumed:** The full chat will always be small enough to
send back to the AI, no matter how long the conversation gets.

**How it actually failed:** Conversations don't stay short. The
longer one goes on, the more text has to be sent back each time.
There is a hard limit on how much the AI can read at once, and a
long chat can hit that limit. Even before hitting it, sending more
text makes the AI slower and costs more. In long ChatGPT chats,
replies got slower the longer things went on, and sometimes the AI
picked up the wrong part of the conversation.

---

## Approach 3: Shrink old messages into a summary

**What it assumed:** Squashing old messages down into a short
summary keeps everything important. Nothing gets lost.

**How it actually failed:** Summaries always leave things out. When
a large file was uploaded to ChatGPT and summarized, parts of the
original file were simply missing from the result. There is no way
to know ahead of time which small detail, a number, a name, a
one-time rule, will turn out to matter later.

---

## Approach 4: Only keep the last few messages (sliding window)

**What it assumed:** Newer messages matter more than older ones, so
it is safe to throw away anything old.

**How it actually failed:** Something important said right at the
start of a chat, like a rule the person gave, gets thrown away just
as fast as someone saying "thanks" a moment ago. The AI remembers
small talk from a minute ago perfectly. It forgets an important
detail from twenty minutes ago, just because it happened earlier.

---

## Approach 5: Keep a separate notes file for important facts

**What it assumed:** It is easy to tell which facts are important
enough to save. Reading that whole file back in will always stay
quick and cheap.

**How it actually failed:** There is no clear rule for deciding what
counts as important. Some things get saved that did not need to be.
Some things that matter later do not get saved at all. On top of
that, after months of use the file holds hundreds or thousands of
facts. Reading the whole thing back in every time brings back the
same slow, expensive problem as Approach 2. It is just hidden inside
a different file now. Nothing ever gets removed, so the file keeps
growing.

---

## Approach 6: Search for facts that sound related

**What it assumed:** If a fact sounds related to the question, it is
the right fact to use, and it is still true right now.

**How it actually failed:** Say someone writes "my favorite food is
pizza" on Monday, then "I like pasta more now" on Friday. Later they
ask "what should I eat tonight?" The search brings back both facts,
because both are about food. It found the right topic, but it has no
way to know which one is still true. There is also no way to fix or
delete a fact once it is wrong. Old and new facts just sit there side
by side, forever, with nothing telling the AI which one to trust.

Searching by meaning only tells the AI what a fact is *about*, like
"food." It does not tell the AI *when* the fact was said or that two
facts are competing answers to the same question. A person reading
both instantly knows Friday beats Monday. The system has no built-in
sense of "still current" versus "outdated" — every saved fact looks
equally true forever, unless something explicitly tells it otherwise.

---

## Quick Summary

| # | Approach | What it assumed | Where it failed |
|---|----------|------------------|------------------|
| 1 | No memory | Chats never need memory | People keep repeating themselves |
| 2 | Send everything back | The chat will always be small enough | Gets slow and expensive, hits a hard limit |
| 3 | Summarize old parts | Summaries keep everything important | Summaries quietly drop details |
| 4 | Keep only recent messages | Newer means more important | Old but important facts get thrown away |
| 5 | Separate notes file | Easy to know what matters, file stays small | No clear rule, file grows huge and slow |
| 6 | Search by meaning | Related means true and current | Cannot tell old facts from new, cannot fix mistakes |

Each failure above points to something the real system needs. That
gets worked out fully in `first_principles.md`, which is Step 4.
