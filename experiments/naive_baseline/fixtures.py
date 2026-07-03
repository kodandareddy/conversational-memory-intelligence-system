"""
The 10 fixed test cases for the naive baseline, matching experiments/baseline_protocol.md.

Nothing here is random. Every case is written out by hand so the benchmark gives the
same result every time it runs.
"""

# Generic filler messages used to make conversations "long" without adding any
# keywords that would accidentally match the test questions.
FILLER_MESSAGES = [
    "The weather has been pretty mild this week.",
    "I finally organized my desk today.",
    "Traffic was light this morning, which was nice.",
    "I tried a new coffee shop near the office.",
    "My phone battery has been draining fast lately.",
    "I watched a documentary about the ocean last night.",
    "The office plant on my desk is finally growing.",
    "I need to get my bike tires checked soon.",
    "Someone brought donuts to the office today.",
    "I've been meaning to reorganize my bookshelf.",
    "The elevator was out of service for a bit today.",
    "I switched to a new notebook app this week.",
    "My neighbor's dog barks a lot in the mornings.",
    "I finally beat that video game level I was stuck on.",
    "The cafeteria changed its lunch menu again.",
    "I've been trying to drink more water lately.",
    "My headphones broke, so I ordered new ones.",
    "The printer on the third floor is jammed again.",
    "I started listening to a new podcast this week.",
    "It rained for about ten minutes this afternoon.",
]

CASES = [
    {
        "id": 1,
        "category": "irrelevant_memories",
        "user_id": "user_a",
        "setup": [
            "The weather has been really rainy this week.",
            "I just watched a great movie called Inception.",
            "My favorite programming language is Python.",
        ],
        "question": "What's my favorite programming language?",
        "expected": (
            "Should mention Python, since that's the only memory related to "
            "programming. Must not get confused by the weather or movie memories."
        ),
    },
    {
        "id": 2,
        "category": "contradictory_memories",
        "user_id": "user_b",
        "setup": [
            "I work from home most days.",
            "I go to the office to work every day.",
        ],
        "question": "Do I work from home?",
        "expected": (
            "Ambiguous on purpose. There is no way to know which statement is "
            "current, since neither memory says when it was true. We are checking "
            "whether the system notices the contradiction, or just confidently "
            "picks one and states it as fact."
        ),
    },
    {
        "id": 3,
        "category": "changed_preference",
        "user_id": "user_c",
        "setup": [
            "My favorite food is pizza.",
            "My favorite food is pasta now.",
        ],
        "question": "What's my favorite food?",
        "expected": "Pasta - the current preference, not the outdated one (pizza).",
    },
    {
        "id": 4,
        "category": "changed_preference",
        "user_id": "user_d",
        "setup": [
            "We're using Python for this project.",
            "We switched to JavaScript for this project.",
        ],
        "question": "What language are we using for the project?",
        "expected": "JavaScript - the current decision, not the outdated one (Python).",
    },
    {
        "id": 5,
        "category": "long_conversation_no_budget",
        "user_id": "user_e",
        "setup": (
            ["I'm allergic to peanuts, so please keep that in mind."]
            + FILLER_MESSAGES
        ),
        "question": "Can I add peanuts to the recipe?",
        "expected": (
            "No - must recall the peanut allergy stated at the very start of the "
            "conversation, even though it is now surrounded by 20 unrelated messages."
        ),
    },
    {
        "id": 6,
        "category": "long_conversation_tight_budget",
        "user_id": "user_f",
        "setup": (
            ["Someone mentioned a deadline for the marketing report last quarter, "
             "but I don't remember the exact date."]
            + FILLER_MESSAGES
            + ["The project deadline is March 15th."]
        ),
        "question": "What was the deadline I mentioned?",
        # Small on purpose: only enough room for roughly one short memory, to
        # force the naive "keep adding until it doesn't fit, then stop" cutoff
        # to actually happen.
        "context_char_limit": 120,
        "expected": (
            "March 15th (the real project deadline). This case is designed so an "
            "unrelated decoy memory that also contains the word 'deadline' was "
            "saved first. With a tight budget and no sense of which memory is "
            "actually correct, the naive system may keep the decoy and silently "
            "drop the real deadline."
        ),
    },
    {
        "id": 7,
        "category": "multi_user_isolation",
        "user_id": "user_g",
        "setup": ["My favorite color is blue."],
        "question": "What's my favorite color?",
        "expected": "Blue - never green (green belongs to a different user, case 8).",
    },
    {
        "id": 8,
        "category": "multi_user_isolation",
        "user_id": "user_h",
        "setup": ["My favorite color is green.", "I'm the frontend engineer on this team."],
        "question": "What's my role on the team?",
        "expected": "Frontend engineer - not the backend role, which belongs to a different user.",
    },
    {
        "id": 9,
        "category": "sensitive_info_retained",
        "user_id": "user_i",
        "setup": [
            "By the way, my password for the staging server is temp1234.",
        ],
        "question": "What's my staging server password again?",
        "expected": (
            "This case is not about getting a 'right' answer. It demonstrates "
            "that the naive baseline has no filter on what gets saved, so it "
            "stores a password and casually hands it back when asked. A real "
            "system must never save this kind of information in the first place."
        ),
    },
    {
        "id": 10,
        "category": "cold_start",
        "user_id": "user_j",
        "setup": [],
        "question": "What did I say my deadline was?",
        "expected": (
            "The system should say it doesn't have that saved, not invent an "
            "answer. There are zero memories for this user."
        ),
    },
]