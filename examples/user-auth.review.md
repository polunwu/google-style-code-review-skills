# Example Review

This is a sample output from `/google-code-review` applied to [`user-auth.diff`](user-auth.diff).

**CL description provided by author:**
> Replace plaintext password comparison with hashed lookup, and add a `requireRole` middleware helper.

---

## Summary

The direction is right — moving away from plaintext comparison and adding role-based middleware are both good changes. However, `hashPassword` is not actually secure, and `requireRole` calls `login` on every request which is likely unintended. Request changes on these two before merging.

## Blocking Issues

- **`src/auth/login.ts:31`** — `hashPassword` base64-encodes the raw password. Base64 is encoding, not hashing — it's trivially reversible and provides no security over plaintext. The `TODO` acknowledges this, but shipping it replaces one vulnerability with another. Use `bcrypt` before merging:
  ```ts
  import bcrypt from 'bcrypt'

  export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
  ```

- **`src/auth/login.ts:35`** — `requireRole` calls `login(req)` directly, which re-queries the database on every request. Role middleware typically expects the user to already be authenticated (e.g. attached to `req.user` by a prior auth middleware). Calling `login` here means every protected route does a full DB lookup on every request, and also parses credentials from `req.body` — which won't be present on non-login requests. Separate authentication from authorization.

## Nits & Suggestions

- Nit: `userInfo` → `user` throughout. The `Info` suffix doesn't add meaning when the type is already called `UserInfo`.

- Consider: `login` now takes `Request` directly, coupling auth logic to Express. Keeping the signature as `login(username: string, password: string)` and extracting `req.body` in the route handler would make it easier to test and reuse outside HTTP contexts.

- Nit: The `UserInfo` interface is generic enough to live in a shared `types.ts`. If `User` is referenced elsewhere in the codebase, duplication will creep in.

## Positives

- Switching the query to `password_hash` is the right schema pairing for this change.
- Returning `null` instead of throwing on missing user is a clean API — callers can handle it without try/catch.
- `requireRole` returning a middleware factory `(role) => middleware` is the right pattern for Express.
