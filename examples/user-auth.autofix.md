# Example: Auto-Fix Run

This is a sample output from `/google-code-review-autofix` applied to [`src/auth/login.ts`](src/auth/login.ts) (the "after" state of [`user-auth.diff`](user-auth.diff)).

**CL description provided by author:**
> Replace plaintext password comparison with hashed lookup, and add a `requireRole` middleware helper.

---

## Iteration 1

### Review

**Status:** CHANGES REQUESTED

**Blocking Issues:**

- **`src/auth/login.ts:24`** — `hashPassword` uses Base64 encoding, not hashing. Base64 is trivially reversible and provides zero security over plaintext. The `TODO` acknowledges this but ships the insecure version. Must use `bcrypt` before merging.

- **`src/auth/login.ts:29`** — `requireRole` calls `login(req)` on every request, which re-queries the database for every protected route. `login(req)` also reads `req.body` (credentials), which won't exist on non-login requests. This conflates authentication with authorization and will silently fail for all protected routes in production.

**Nits:** `userInfo` → `user`; `login` coupled to `Request` makes it untestable outside HTTP.

**Positives:** `password_hash` column name is correct; returning `null` instead of throwing is clean API design; middleware factory pattern `(role) => middleware` is correct for Express.

### Fixes Applied

1. **`src/auth/login.ts:24`** — Removed `hashPassword`. Changed query to fetch by username only, then verify the submitted password against the stored hash using `bcrypt.compare`. Function signature changed to `(username, password)` to decouple from Express.

2. **`src/auth/login.ts:29`** — `requireRole` now reads from `req.user` (set by an upstream auth middleware) instead of calling `login`. Authentication and authorization are now separate concerns.

**Resulting code:**

```ts
import bcrypt from 'bcrypt'
import { db } from '../db'
import { Request, Response, NextFunction } from 'express'

interface UserInfo {
  id: number
  username: string
  role: string
}

export async function login(username: string, password: string): Promise<UserInfo | null> {
  const result = await db.query(
    'SELECT id, username, role, password_hash FROM users WHERE username = $1',
    [username]
  )

  const user = result.rows[0] ?? null
  if (!user) return null

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return null

  return { id: user.id, username: user.username, role: user.role }
}

export function requireRole(role: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserInfo | undefined
    if (!user) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }
    if (user.role !== role) {
      res.status(403).json({ error: 'forbidden' })
      return
    }
    next()
  }
}
```

---

## Iteration 2

### Review

**Status:** APPROVED

**Blocking Issues:** None

**Nits:** `req.user` cast requires an Express type augmentation (`declare global { namespace Express { interface Request { user?: UserInfo } } }`) — author's discretion.

**Positives:**
- `bcrypt.compare` correctly used — passwords are no longer stored or compared in reversible form
- `login` decoupled from Express, independently unit-testable
- `requireRole` handles only authorization, not authentication — single responsibility

---

## Auto-Fix Summary

**Result:** APPROVED ✓  
**Iterations:** 2

**Fixes Applied:**
1. `src/auth/login.ts:24` — Replaced Base64 pseudo-hash with `bcrypt.compare`; decoupled `login` from Express `Request`
2. `src/auth/login.ts:29` — `requireRole` reads `req.user` instead of re-calling `login` on every request

**Nits for Author's Consideration:**
- Add Express type augmentation for `req.user` to avoid `as` cast
- Consider moving `UserInfo` interface to a shared `types.ts` if referenced elsewhere
