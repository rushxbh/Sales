import fs from "fs"
import path from "path"
import { app } from "electron"
import { getDatabase } from "./database"

export interface BackupInfo {
  filename: string
  size: number
  created_at: string
}

export function createBackup(): Promise<{ success: boolean; message: string; filename?: string }> {
  return new Promise((resolve) => {
    try {
      const db = getDatabase()
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const backupFilename = `backup_${timestamp}.db`
      const backupPath = path.join(app.getPath("userData"), "backups", backupFilename)

      // Ensure backup directory exists
      const backupDir = path.dirname(backupPath)
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }

      // Create backup using SQLite backup API
      const backup = db.backup(backupPath)

      backup.step(-1) // Copy entire database
      backup.finish()

      resolve({
        success: true,
        message: "Backup created successfully",
        filename: backupFilename,
      })
    } catch (error) {
      console.error("Backup error:", error)
      resolve({
        success: false,
        message: error instanceof Error ? error.message : "Backup failed",
      })
    }
  })
}

export function restoreBackup(backupFilename: string): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    try {
      const backupPath = path.join(app.getPath("userData"), "backups", backupFilename)

      if (!fs.existsSync(backupPath)) {
        resolve({
          success: false,
          message: "Backup file not found",
        })
        return
      }

      // Close current database
      const db = getDatabase()
      db.close()

      // Replace current database with backup
      const currentDbPath = path.join(app.getPath("userData"), "inventory.db")
      fs.copyFileSync(backupPath, currentDbPath)

      // Reinitialize database
      const { initDatabase } = require("./database")
      initDatabase()

      resolve({
        success: true,
        message: "Database restored successfully",
      })
    } catch (error) {
      console.error("Restore error:", error)
      resolve({
        success: false,
        message: error instanceof Error ? error.message : "Restore failed",
      })
    }
  })
}

export function getBackupList(): BackupInfo[] {
  try {
    const backupDir = path.join(app.getPath("userData"), "backups")

    if (!fs.existsSync(backupDir)) {
      return []
    }

    const files = fs
      .readdirSync(backupDir)
      .filter((file) => file.endsWith(".db"))
      .map((file) => {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)

        return {
          filename: file,
          size: stats.size,
          created_at: stats.birthtime.toISOString(),
        }
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return files
  } catch (error) {
    console.error("Get backup list error:", error)
    return []
  }
}

export function deleteBackup(backupFilename: string): { success: boolean; message: string } {
  try {
    const backupPath = path.join(app.getPath("userData"), "backups", backupFilename)

    if (!fs.existsSync(backupPath)) {
      return {
        success: false,
        message: "Backup file not found",
      }
    }

    fs.unlinkSync(backupPath)

    return {
      success: true,
      message: "Backup deleted successfully",
    }
  } catch (error) {
    console.error("Delete backup error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete backup",
    }
  }
}

export function scheduleAutoBackup(frequency: "daily" | "weekly" | "monthly") {
  const intervals = {
    daily: 24 * 60 * 60 * 1000, // 24 hours
    weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
    monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
  }

  const interval = intervals[frequency]

  setInterval(async () => {
    console.log("Creating automatic backup...")
    const result = await createBackup()

    if (result.success) {
      console.log("Automatic backup created:", result.filename)

      // Clean up old backups (keep last 10)
      const backups = getBackupList()
      if (backups.length > 10) {
        const oldBackups = backups.slice(10)
        oldBackups.forEach((backup) => {
          deleteBackup(backup.filename)
        })
      }
    } else {
      console.error("Automatic backup failed:", result.message)
    }
  }, interval)
}
