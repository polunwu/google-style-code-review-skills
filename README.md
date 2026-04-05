# google-code-review

Two [Claude Code](https://claude.ai/code) skills for code review following **Google's Engineering Practices** guidelines.

| Skill | What it does |
|-------|-------------|
| `/google-code-review` | Reviews your code and produces structured feedback with severity labels |
| `/google-code-review-autofix` | Reviews your code, automatically fixes all blocking issues, and re-reviews — repeating until approved (up to 5 iterations) |

## What it does

**`/google-code-review`** transforms Claude into a code reviewer that evaluates your code across eight dimensions — design, functionality, complexity, tests, naming, comments, style, and documentation — using the same standards documented in [Google's Engineering Practices](https://google.github.io/eng-practices/review/reviewer/).

Output is structured with clear severity labels so you know what must be fixed versus what's optional.

**`/google-code-review-autofix`** goes one step further: after identifying blocking issues, it edits your files directly to fix them, then re-reviews the result. It loops until there are no blocking issues remaining or the 5-iteration limit is reached.

## Installation

### Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed and authenticated
- Claude Code version that supports skills (`~/.claude/skills/` directory)

### Steps

**1. Clone this repo (or download the skill file)**

```bash
git clone https://github.com/polunwu/google-code-review-skill.git
cd google-code-review-skill
```

**2. Create the skills directory if it doesn't exist**

```bash
mkdir -p ~/.claude/skills
```

**3. Copy the skill folder(s)**

```bash
cp -r google-code-review ~/.claude/skills/
cp -r google-code-review-autofix ~/.claude/skills/
```

Or symlink to automatically get updates when you pull:

```bash
ln -s "$(pwd)/google-code-review" ~/.claude/skills/google-code-review
ln -s "$(pwd)/google-code-review-autofix" ~/.claude/skills/google-code-review-autofix
```

**4. Verify installation**

Open a new Claude Code session and type `/` — you should see both `google-code-review` and `google-code-review-autofix` listed among the available skills.

> **Note:** Skills directory location is `~/.claude/skills/` on macOS and Linux. On Windows, use `%USERPROFILE%\.claude\skills\`.

## Usage

### `/google-code-review`

Invoke with your code or diff:

```
/google-code-review

[paste your code or diff here]
```

### `/google-code-review-autofix`

Invoke with a file path (so Claude can edit the files directly) and a CL description:

```
/google-code-review-autofix

File: src/auth/login.ts
CL description: Replace plaintext password comparison with hashed lookup.
```

Claude will review, fix blocking issues in-place, and re-review until the code is approved.

### Example output

See [`examples/`](examples/) for sample input and output:

| File | Description |
|------|-------------|
| [`user-auth.diff`](examples/user-auth.diff) | Input diff with two blocking security issues |
| [`user-auth.review.md`](examples/user-auth.review.md) | Output from `/google-code-review` |
| [`user-auth.autofix.md`](examples/user-auth.autofix.md) | Output from `/google-code-review-autofix` — 2 iterations to approval |
| [`src/auth/login.ts`](examples/src/auth/login.ts) | Fixed file after auto-fix run |

## What the skill covers

The skill distills these Google Engineering Practices pages:

**Reviewer Guide**
- [The Standard of Code Review](https://google.github.io/eng-practices/review/reviewer/standard.html) — core approval principle
- [What to Look For](https://google.github.io/eng-practices/review/reviewer/looking-for.html) — eight review dimensions
- [Navigating a CL](https://google.github.io/eng-practices/review/reviewer/navigate.html) — where to focus first
- [Speed of Code Reviews](https://google.github.io/eng-practices/review/reviewer/speed.html) — response time standards
- [How to Write Comments](https://google.github.io/eng-practices/review/reviewer/comments.html) — tone, labels, clarity
- [Handling Pushback](https://google.github.io/eng-practices/review/reviewer/pushback.html) — resolving disagreements

**Author Guide**
- [Writing Good CL Descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html)
- [Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html)
- [Handling Reviewer Comments](https://google.github.io/eng-practices/review/developer/handling-comments.html)

## Comment severity labels

| Label | Meaning |
|-------|---------|
| **(blocking)** | Must be resolved before approval |
| `Nit:` | Minor issue, low impact — author's discretion |
| `Optional:` / `Consider:` | Suggestion, no requirement to act |
| `FYI:` | Informational only |

## Philosophy

This skill follows Google's central principle: **approve code that improves overall codebase health**, even if imperfect. Perfection is not the goal — forward progress is. Blocking issues represent genuine risks; everything else is guidance.

## Source

All guidelines are derived from [google.github.io/eng-practices](https://google.github.io/eng-practices/), which is licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).

## License

MIT — see [LICENSE](LICENSE)
