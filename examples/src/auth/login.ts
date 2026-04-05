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
