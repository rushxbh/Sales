import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { getDatabase } from "./database"

const JWT_SECRET = "your-secret-key-change-in-production"

export interface User {
  id: number
  username: string
  full_name: string
  role: string
  email: string
  is_active: boolean
}

export interface LoginResult {
  success: boolean
  user?: User
  token?: string
  message?: string
}

export async function authenticateUser(username: string, password: string): Promise<LoginResult> {
  try {
    const db = getDatabase()

    const user = db
      .prepare(`
      SELECT id, username, password_hash, full_name, role, email, is_active
      FROM users 
      WHERE username = ? AND is_active = 1
    `)
      .get(username) as any

    if (!user) {
      return { success: false, message: "Invalid username or password" }
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return { success: false, message: "Invalid username or password" }
    }

    // Update last login
    db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(user.id)

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    const userInfo: User = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      email: user.email,
      is_active: user.is_active,
    }

    return {
      success: true,
      user: userInfo,
      token,
      message: "Login successful",
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, message: "Authentication failed" }
  }
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function createUser(userData: {
  username: string
  password: string
  full_name: string
  role: string
  email: string
}): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const db = getDatabase()

    // Check if username already exists
    const existingUser = db.prepare("SELECT id FROM users WHERE username = ?").get(userData.username)

    if (existingUser) {
      return { success: false, message: "Username already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // Insert new user
    const result = db
      .prepare(`
      INSERT INTO users (username, password_hash, full_name, role, email)
      VALUES (?, ?, ?, ?, ?)
    `)
      .run(userData.username, hashedPassword, userData.full_name, userData.role, userData.email)

    const newUser: User = {
      id: result.lastInsertRowid as number,
      username: userData.username,
      full_name: userData.full_name,
      role: userData.role,
      email: userData.email,
      is_active: true,
    }

    return {
      success: true,
      message: "User created successfully",
      user: newUser,
    }
  } catch (error) {
    console.error("User creation error:", error)
    return { success: false, message: "Failed to create user" }
  }
}

export function getAllUsers(): User[] {
  try {
    const db = getDatabase()

    const users = db
      .prepare(`
      SELECT id, username, full_name, role, email, is_active
      FROM users
      ORDER BY full_name
    `)
      .all() as User[]

    return users
  } catch (error) {
    console.error("Get users error:", error)
    return []
  }
}
