const Database = require("better-sqlite3")
const bcrypt = require("bcrypt")
const path = require("path")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const dbPath = path.join(process.cwd(), "database", "inventory.db")

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function createAdmin() {
  console.log("🔐 Create New Admin User")
  console.log("========================")

  try {
    const db = new Database(dbPath)

    const username = await askQuestion("Enter username: ")
    const fullName = await askQuestion("Enter full name: ")
    const email = await askQuestion("Enter email: ")
    const password = await askQuestion("Enter password: ")
    const confirmPassword = await askQuestion("Confirm password: ")

    if (password !== confirmPassword) {
      console.log("❌ Passwords do not match!")
      process.exit(1)
    }

    if (password.length < 6) {
      console.log("❌ Password must be at least 6 characters!")
      process.exit(1)
    }

    // Check if username already exists
    const existingUser = db.prepare("SELECT id FROM users WHERE username = ?").get(username)
    if (existingUser) {
      console.log("❌ Username already exists!")
      process.exit(1)
    }

    // Hash password and create user
    const hashedPassword = bcrypt.hashSync(password, 10)

    const result = db
      .prepare(`
      INSERT INTO users (username, password_hash, full_name, role, email)
      VALUES (?, ?, ?, ?, ?)
    `)
      .run(username, hashedPassword, fullName, "Admin", email)

    console.log("✅ Admin user created successfully!")
    console.log(`👤 User ID: ${result.lastInsertRowid}`)
    console.log(`📧 Email: ${email}`)

    db.close()
  } catch (error) {
    console.error("❌ Failed to create admin user:", error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

createAdmin()
