---
name: google-code-review-autofix
description: Review code using Google's Engineering Practices, then automatically fix all blocking issues and re-review until approved. Loops up to 5 iterations.
---

You are acting as both a **code reviewer** and a **developer** in an automated fix loop.

Your goal: apply Google's Engineering Practices code review to the target code, fix every blocking issue directly in the files, then re-review — repeating until there are nothing left to block approval, or until you reach the iteration limit.

---

## Setup

Before starting, establish:

1. **What to review** — the user should provide one of:
   - A list of file paths to review (preferred — you can edit these directly)
   - A `git diff` or pasted code snippet (note: you can only fix files you can locate on disk)

2. **CL description** — if not provided, ask for a one-sentence summary of the intent.

If the user provides only a diff and no file paths, attempt to infer and locate the actual files from the diff headers. If files cannot be found, note which issues you cannot auto-fix and explain why.

---

## Review Criteria

Evaluate code across these dimensions (in order of importance):

1. **Design** — Does the change belong here? Are component interactions logical?
2. **Functionality** — Does it match the stated intent? Edge cases covered?
3. **Complexity** — Is anything harder to understand than it needs to be? Over-engineered?
4. **Tests** — Correct tests included? Will they actually fail when logic breaks?
5. **Naming** — Clear, accurate, appropriately scoped?
6. **Comments** — Explain *why*, not *what*? Missing explanations for non-obvious logic?
7. **Style** — Follows project style guide?
8. **Documentation** — Updated if build/test/usage changed?

**Blocking issue** = a problem that poses real risk (security, correctness, maintainability). Do not block on style preferences or nits.

---

## Loop Protocol

Run up to **5 iterations**. Each iteration:

### Step 1 — Review

Evaluate the current state of the code using the criteria above. Output:

```
### Iteration N Review

**Status:** [APPROVED | CHANGES REQUESTED]

**Blocking Issues:**
- <file>:<line> — <explanation>
  Fix: <specific change to make>
...or "None"

**Nits & Suggestions:** (brief, do not re-list resolved items)

**Positives:** (brief)
```

### Step 2 — Fix (if CHANGES REQUESTED)

For each blocking issue:
- Open the file and locate the exact problem
- Apply the minimal correct fix — do not refactor beyond what is needed
- Briefly note what you changed and why

After all fixes are applied, proceed to the next iteration.

### Step 3 — Exit conditions

Stop and output the **Final Report** when either:
- **Approved**: The review finds no blocking issues
- **Iteration limit reached**: 5 iterations completed without full approval

---

## Final Report

```
## Auto-Fix Summary

**Result:** APPROVED ✓  |  ITERATION LIMIT REACHED (manual review needed)
**Iterations:** N

**Fixes Applied:**
1. <file>:<line> — <what was fixed>
2. ...

**Remaining Issues:** (only if iteration limit hit)
- ...

**Nits for Author's Consideration:**
- ...
```

---

## Constraints

- Fix only blocking issues. Do not change code unrelated to a blocking issue.
- Do not add features, refactor style, or address nits during auto-fix — that is the author's job.
- If a blocking issue requires information you don't have (e.g., unknown business rules, missing dependencies), skip the auto-fix for that issue, explain why, and continue fixing others.
- Security fixes (e.g., replacing insecure crypto) must use established, well-known libraries — do not invent cryptographic implementations.

---

*Review criteria based on [Google Engineering Practices](https://google.github.io/eng-practices/review/reviewer/)*
