# google-code-review

A [Claude Code](https://claude.ai/code) skill that performs code reviews following **Google's Engineering Practices** guidelines.

## What it does

When invoked, this skill transforms Claude into a code reviewer that evaluates your code across eight dimensions — design, functionality, complexity, tests, naming, comments, style, and documentation — using the same standards documented in [Google's Engineering Practices](https://google.github.io/eng-practices/review/reviewer/).

Output is structured with clear severity labels so you know what must be fixed versus what's optional.

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

**3. Copy the skill folder**

```bash
cp -r google-code-review ~/.claude/skills/
```

Or symlink to automatically get updates when you pull:

```bash
ln -s "$(pwd)/google-code-review" ~/.claude/skills/google-code-review
```

**4. Verify installation**

Open a new Claude Code session and type `/` — you should see `google-code-review` listed among the available skills.

> **Note:** Skills directory location is `~/.claude/skills/` on macOS and Linux. On Windows, use `%USERPROFILE%\.claude\skills\`.

## Usage

In any Claude Code session, invoke the skill with `/google-code-review` followed by your code or diff:

```
/google-code-review

[paste your code or diff here]
```

### Example output

See [`examples/`](examples/) for a sample TypeScript diff and its full review output.


```
## Summary
Overall the change is solid. One blocking issue around error handling,
plus a few nits on naming. Recommend approving after the blocking issue is resolved.

## Blocking Issues
- `auth/login.go:42` — Error from `db.Query()` is silently ignored. If the query
  fails, the function returns a zero-value user and no error, which will cause a
  silent authentication bypass. Handle or propagate this error explicitly.

## Nits & Suggestions
- Nit: `userInfo` → `user` would be clearer and consistent with the rest of the package
- Consider: The retry loop on line 67 could be extracted into a helper — same
  pattern appears in `auth/refresh.go`

## Positives
- Good test coverage on the happy path, including the edge case for expired tokens
- CL description clearly explains the motivation and tradeoffs
```

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
