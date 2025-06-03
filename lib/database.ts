import Database from "better-sqlite3"
import path from "path"
import { app } from "electron"
import fs from "fs"
import { logger } from "./logger"

// Database connection
let db: Database.Database | null = null

export function initDatabase(): Database.Database {
  try {
    const userDataPath = app.getPath("userData")
    const dbDir = path.join(userDataPath, "database")

    // Ensure database directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    const dbPath = path.join(dbDir, "inventory.db")
    db = new Database(dbPath)

    // Enable foreign keys and WAL mode for better performance
    db.pragma("foreign_keys = ON")
    db.pragma("journal_mode = WAL")
    db.pragma("synchronous = NORMAL")
    db.pragma("cache_size = 1000")
    db.pragma("temp_store = memory")

    logger.info(`Database initialized at: ${dbPath}`)

    // Create tables
    createTables()

    // Insert default data
    insertDefaultData()

    return db
  } catch (error) {
    logger.error("Failed to initialize database:", error)
    throw error
  }
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.")
  }
  return db
}

function createTables() {
  if (!db) return

  try {
    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'Sales',
        email VARCHAR(100),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Categories table
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Suppliers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        contact_person VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        gst_number VARCHAR(15),
        payment_terms INTEGER DEFAULT 30,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Products table
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category_id INTEGER,
        unit VARCHAR(20) NOT NULL,
        purchase_price DECIMAL(10,2) DEFAULT 0,
        selling_price DECIMAL(10,2) NOT NULL,
        reorder_level INTEGER DEFAULT 0,
        barcode VARCHAR(50),
        hsn_code VARCHAR(10),
        tax_rate DECIMAL(5,2) DEFAULT 18.00,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `)

    // Inventory table
    db.exec(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER UNIQUE,
        current_stock DECIMAL(10,2) DEFAULT 0,
        reserved_stock DECIMAL(10,2) DEFAULT 0,
        location VARCHAR(50) DEFAULT 'Main Store',
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `)

    // Customers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        contact_person VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        gst_number VARCHAR(15),
        credit_limit DECIMAL(10,2) DEFAULT 0,
        payment_terms INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Sales invoices table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sales_invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER,
        invoice_date DATE NOT NULL,
        due_date DATE,
        subtotal DECIMAL(12,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(12,2) DEFAULT 0,
        paid_amount DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Pending',
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    // Sales invoice items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sales_invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER,
        product_id INTEGER,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        discount_percent DECIMAL(5,2) DEFAULT 0,
        tax_rate DECIMAL(5,2) NOT NULL,
        total_price DECIMAL(12,2) NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)

    // Purchase orders table
    db.exec(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        po_number VARCHAR(50) UNIQUE NOT NULL,
        supplier_id INTEGER,
        po_date DATE NOT NULL,
        expected_delivery DATE,
        total_amount DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Pending',
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    // Purchase order items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        po_id INTEGER,
        product_id INTEGER,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(12,2) NOT NULL,
        received_quantity DECIMAL(10,2) DEFAULT 0,
        FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)

    // Stock movements table
    db.exec(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        movement_type VARCHAR(20) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        reference_type VARCHAR(20),
        reference_id INTEGER,
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    // Payments table
    db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        payment_date DATE NOT NULL,
        reference_number VARCHAR(50),
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    // Settings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key VARCHAR(50) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Audit log table
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action VARCHAR(50) NOT NULL,
        table_name VARCHAR(50),
        record_id INTEGER,
        old_values TEXT,
        new_values TEXT,
        ip_address VARCHAR(45),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Quotations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS quotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER,
        quote_date DATE NOT NULL,
        valid_until DATE,
        subtotal DECIMAL(12,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Draft',
        notes TEXT,
        terms_conditions TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    // Quotation items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS quotation_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id INTEGER,
        product_id INTEGER,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        discount_percent DECIMAL(5,2) DEFAULT 0,
        tax_rate DECIMAL(5,2) NOT NULL,
        total_price DECIMAL(12,2) NOT NULL,
        FOREIGN KEY (quote_id) REFERENCES quotations(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)

    // Create indexes for better performance
    createIndexes()

    logger.info("Database tables created successfully")
  } catch (error) {
    logger.error("Failed to create database tables:", error)
    throw error
  }
}

function createIndexes() {
  if (!db) return

  try {
    // Create indexes for frequently queried columns
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)",
      "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)",
      "CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)",
      "CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id)",
      "CREATE INDEX IF NOT EXISTS idx_invoices_customer ON sales_invoices(customer_id)",
      "CREATE INDEX IF NOT EXISTS idx_invoices_date ON sales_invoices(invoice_date)",
      "CREATE INDEX IF NOT EXISTS idx_invoices_status ON sales_invoices(status)",
      "CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON sales_invoice_items(invoice_id)",
      "CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON sales_invoice_items(product_id)",
      "CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id)",
      "CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id)",
      "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
      "CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)",
      "CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active)",
      "CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active)",
      "CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active)",
      "CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_audit_log_date ON audit_log(created_at)",
    ]

    indexes.forEach((indexSql) => {
      db!.exec(indexSql)
    })

    logger.info("Database indexes created successfully")
  } catch (error) {
    logger.error("Failed to create database indexes:", error)
  }
}

function insertDefaultData() {
  if (!db) return

  try {
    // Check if admin user exists
    const adminExists = db.prepare("SELECT COUNT(*) as count FROM users WHERE username = ?").get("admin") as {
      count: number
    }

    if (adminExists.count === 0) {
      const bcrypt = require("bcrypt")
      const hashedPassword = bcrypt.hashSync("admin123", 10)

      db.prepare(`
        INSERT INTO users (username, password_hash, full_name, role, email)
        VALUES (?, ?, ?, ?, ?)
      `).run("admin", hashedPassword, "System Administrator", "Admin", "admin@company.com")

      logger.info("Default admin user created")
    }

    // Insert default categories
    const categories = [
      { name: "Plywood", description: "All types of plywood sheets and boards" },
      { name: "Laminates", description: "Decorative laminates and veneers" },
      { name: "Hardware", description: "Furniture hardware and fittings" },
      { name: "Edge Bands", description: "PVC and wood edge banding materials" },
      { name: "Adhesives", description: "Glues, adhesives and bonding materials" },
      { name: "Tools", description: "Hand tools and power tools" },
      { name: "Accessories", description: "Miscellaneous accessories and supplies" },
    ]

    categories.forEach((category) => {
      db!
        .prepare(`
        INSERT OR IGNORE INTO categories (name, description)
        VALUES (?, ?)
      `)
        .run(category.name, category.description)
    })

    // Insert default settings
    const defaultSettings = [
      { key: "company_name", value: "Your Company Name", description: "Company name for invoices" },
      { key: "company_address", value: "Your Company Address", description: "Company address for invoices" },
      { key: "company_phone", value: "+91-XXXXXXXXXX", description: "Company phone number" },
      { key: "company_email", value: "info@company.com", description: "Company email address" },
      { key: "gst_number", value: "GSTIN123456789", description: "Company GST number" },
      { key: "default_tax_rate", value: "18.00", description: "Default tax rate percentage" },
      { key: "invoice_prefix", value: "INV", description: "Invoice number prefix" },
      { key: "po_prefix", value: "PO", description: "Purchase order prefix" },
      { key: "quote_prefix", value: "QUO", description: "Quotation number prefix" },
      { key: "backup_frequency", value: "daily", description: "Automatic backup frequency" },
      { key: "low_stock_alert", value: "true", description: "Enable low stock alerts" },
      { key: "currency_symbol", value: "₹", description: "Currency symbol" },
      { key: "date_format", value: "DD/MM/YYYY", description: "Date display format" },
      { key: "decimal_places", value: "2", description: "Number of decimal places for amounts" },
    ]

    defaultSettings.forEach((setting) => {
      db!
        .prepare(`
        INSERT OR IGNORE INTO settings (key, value, description)
        VALUES (?, ?, ?)
      `)
        .run(setting.key, setting.value, setting.description)
    })

    logger.info("Default data inserted successfully")
  } catch (error) {
    logger.error("Failed to insert default data:", error)
  }
}

export function closeDatabase() {
  if (db) {
    try {
      db.close()
      db = null
      logger.info("Database connection closed")
    } catch (error) {
      logger.error("Error closing database:", error)
    }
  }
}

export function backupDatabase(backupPath: string): boolean {
  if (!db) return false

  try {
    const backup = db.backup(backupPath)
    backup.step(-1) // Copy entire database
    backup.finish()
    logger.info(`Database backed up to: ${backupPath}`)
    return true
  } catch (error) {
    logger.error("Database backup failed:", error)
    return false
  }
}

export function restoreDatabase(backupPath: string): boolean {
  try {
    if (!fs.existsSync(backupPath)) {
      logger.error(`Backup file not found: ${backupPath}`)
      return false
    }

    // Close current database
    closeDatabase()

    // Copy backup file to current database location
    const userDataPath = app.getPath("userData")
    const dbPath = path.join(userDataPath, "database", "inventory.db")

    fs.copyFileSync(backupPath, dbPath)

    // Reinitialize database
    initDatabase()

    logger.info(`Database restored from: ${backupPath}`)
    return true
  } catch (error) {
    logger.error("Database restore failed:", error)
    return false
  }
}
