const Database = require("better-sqlite3")
const bcrypt = require("bcrypt")
const path = require("path")
const fs = require("fs")

console.log("🚀 Initializing Sales & Inventory Management Database...")

// Create database directory
const dbDir = path.join(process.cwd(), "database")
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const dbPath = path.join(dbDir, "inventory.db")

// Remove existing database if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log("🗑️  Removed existing database")
}

const db = new Database(dbPath)

// Enable foreign keys and optimize performance
db.pragma("foreign_keys = ON")
db.pragma("journal_mode = WAL")
db.pragma("synchronous = NORMAL")

console.log("📊 Creating database tables...")

// Create all tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE users (
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
    CREATE TABLE categories (
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
    CREATE TABLE suppliers (
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
    CREATE TABLE products (
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
    CREATE TABLE inventory (
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
    CREATE TABLE customers (
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
    CREATE TABLE sales_invoices (
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
    CREATE TABLE sales_invoice_items (
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

  // Additional tables...
  db.exec(`
    CREATE TABLE purchase_orders (
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

  db.exec(`
    CREATE TABLE purchase_order_items (
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

  db.exec(`
    CREATE TABLE stock_movements (
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

  db.exec(`
    CREATE TABLE payments (
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

  db.exec(`
    CREATE TABLE settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key VARCHAR(50) UNIQUE NOT NULL,
      value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`
    CREATE TABLE audit_log (
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

  console.log("✅ Database tables created successfully")
}

// Create indexes
const createIndexes = () => {
  const indexes = [
    "CREATE INDEX idx_products_sku ON products(sku)",
    "CREATE INDEX idx_products_category ON products(category_id)",
    "CREATE INDEX idx_products_active ON products(is_active)",
    "CREATE INDEX idx_inventory_product ON inventory(product_id)",
    "CREATE INDEX idx_invoices_customer ON sales_invoices(customer_id)",
    "CREATE INDEX idx_invoices_date ON sales_invoices(invoice_date)",
    "CREATE INDEX idx_invoices_status ON sales_invoices(status)",
    "CREATE INDEX idx_invoice_items_invoice ON sales_invoice_items(invoice_id)",
    "CREATE INDEX idx_invoice_items_product ON sales_invoice_items(product_id)",
    "CREATE INDEX idx_stock_movements_product ON stock_movements(product_id)",
    "CREATE INDEX idx_stock_movements_date ON stock_movements(created_at)",
    "CREATE INDEX idx_payments_invoice ON payments(invoice_id)",
    "CREATE INDEX idx_users_username ON users(username)",
    "CREATE INDEX idx_users_active ON users(is_active)",
    "CREATE INDEX idx_customers_active ON customers(is_active)",
    "CREATE INDEX idx_suppliers_active ON suppliers(is_active)",
    "CREATE INDEX idx_categories_active ON categories(is_active)",
  ]

  indexes.forEach((indexSql) => {
    db.exec(indexSql)
  })

  console.log("📈 Database indexes created successfully")
}

// Insert default data
const insertDefaultData = () => {
  console.log("📝 Inserting default data...")

  // Create admin user
  const hashedPassword = bcrypt.hashSync("admin123", 10)
  db.prepare(`
    INSERT INTO users (username, password_hash, full_name, role, email)
    VALUES (?, ?, ?, ?, ?)
  `).run("admin", hashedPassword, "System Administrator", "Admin", "admin@company.com")

  // Insert categories
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
    db.prepare(`
      INSERT INTO categories (name, description)
      VALUES (?, ?)
    `).run(category.name, category.description)
  })

  // Insert default settings
  const settings = [
    { key: "company_name", value: "Your Company Name", description: "Company name for invoices" },
    { key: "company_address", value: "Your Company Address", description: "Company address for invoices" },
    { key: "company_phone", value: "+91-XXXXXXXXXX", description: "Company phone number" },
    { key: "company_email", value: "info@company.com", description: "Company email address" },
    { key: "gst_number", value: "GSTIN123456789", description: "Company GST number" },
    { key: "default_tax_rate", value: "18.00", description: "Default tax rate percentage" },
    { key: "invoice_prefix", value: "INV", description: "Invoice number prefix" },
    { key: "po_prefix", value: "PO", description: "Purchase order prefix" },
    { key: "backup_frequency", value: "daily", description: "Automatic backup frequency" },
    { key: "low_stock_alert", value: "true", description: "Enable low stock alerts" },
    { key: "currency_symbol", value: "₹", description: "Currency symbol" },
    { key: "date_format", value: "DD/MM/YYYY", description: "Date display format" },
  ]

  settings.forEach((setting) => {
    db.prepare(`
      INSERT INTO settings (key, value, description)
      VALUES (?, ?, ?)
    `).run(setting.key, setting.value, setting.description)
  })

  // Insert sample customers
  const customers = [
    {
      name: "ABC Furniture",
      contact_person: "John Doe",
      phone: "+91-9876543210",
      email: "john@abcfurniture.com",
      address: "123 Main Street, Mumbai",
      gst_number: "GST123456789",
    },
    {
      name: "XYZ Interiors",
      contact_person: "Jane Smith",
      phone: "+91-9876543211",
      email: "jane@xyzinteriors.com",
      address: "456 Oak Avenue, Delhi",
      gst_number: "GST987654321",
    },
    {
      name: "Modern Designs",
      contact_person: "Mike Johnson",
      phone: "+91-9876543212",
      email: "mike@moderndesigns.com",
      address: "789 Pine Road, Bangalore",
      gst_number: "GST456789123",
    },
  ]

  customers.forEach((customer) => {
    db.prepare(`
      INSERT INTO customers (name, contact_person, phone, email, address, gst_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      customer.name,
      customer.contact_person,
      customer.phone,
      customer.email,
      customer.address,
      customer.gst_number,
    )
  })

  // Insert sample suppliers
  const suppliers = [
    {
      name: "Timber Mart",
      contact_person: "Raj Kumar",
      phone: "+91-9876543213",
      email: "raj@timbermart.com",
      address: "321 Wood Street, Chennai",
      gst_number: "GST789123456",
    },
    {
      name: "Hardware Plus",
      contact_person: "Suresh Patel",
      phone: "+91-9876543214",
      email: "suresh@hardwareplus.com",
      address: "654 Steel Avenue, Pune",
      gst_number: "GST321654987",
    },
    {
      name: "Laminate World",
      contact_person: "Priya Sharma",
      phone: "+91-9876543215",
      email: "priya@laminateworld.com",
      address: "987 Design Plaza, Hyderabad",
      gst_number: "GST654987321",
    },
  ]

  suppliers.forEach((supplier) => {
    db.prepare(`
      INSERT INTO suppliers (name, contact_person, phone, email, address, gst_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      supplier.name,
      supplier.contact_person,
      supplier.phone,
      supplier.email,
      supplier.address,
      supplier.gst_number,
    )
  })

  // Insert sample products
  const products = [
    {
      sku: "PLY001",
      name: "Marine Plywood 18mm",
      description: "High quality marine grade plywood",
      category_id: 1,
      unit: "sheets",
      purchase_price: 2000,
      selling_price: 2500,
      reorder_level: 20,
      hsn_code: "4412",
      tax_rate: 18.0,
    },
    {
      sku: "PLY002",
      name: "Commercial Plywood 12mm",
      description: "Standard commercial plywood",
      category_id: 1,
      unit: "sheets",
      purchase_price: 1200,
      selling_price: 1500,
      reorder_level: 25,
      hsn_code: "4412",
      tax_rate: 18.0,
    },
    {
      sku: "LAM001",
      name: "Sunmica Laminate - Walnut",
      description: "Premium walnut finish laminate",
      category_id: 2,
      unit: "sheets",
      purchase_price: 650,
      selling_price: 850,
      reorder_level: 15,
      hsn_code: "3921",
      tax_rate: 18.0,
    },
    {
      sku: "LAM002",
      name: "Sunmica Laminate - Oak",
      description: "Natural oak finish laminate",
      category_id: 2,
      unit: "sheets",
      purchase_price: 600,
      selling_price: 800,
      reorder_level: 15,
      hsn_code: "3921",
      tax_rate: 18.0,
    },
    {
      sku: "HW001",
      name: "Soft Close Hinges",
      description: "Premium soft close cabinet hinges",
      category_id: 3,
      unit: "pcs",
      purchase_price: 35,
      selling_price: 45,
      reorder_level: 50,
      hsn_code: "8302",
      tax_rate: 18.0,
    },
    {
      sku: "HW002",
      name: 'Drawer Slides 18"',
      description: "Heavy duty drawer slides",
      category_id: 3,
      unit: "pairs",
      purchase_price: 120,
      selling_price: 150,
      reorder_level: 30,
      hsn_code: "8302",
      tax_rate: 18.0,
    },
    {
      sku: "EB001",
      name: "PVC Edge Band 22mm",
      description: "White PVC edge banding",
      category_id: 4,
      unit: "meters",
      purchase_price: 8,
      selling_price: 12,
      reorder_level: 100,
      hsn_code: "3921",
      tax_rate: 18.0,
    },
    {
      sku: "ADH001",
      name: "Fevicol MR",
      description: "Moisture resistant adhesive",
      category_id: 5,
      unit: "kg",
      purchase_price: 180,
      selling_price: 220,
      reorder_level: 20,
      hsn_code: "3506",
      tax_rate: 18.0,
    },
  ]

  products.forEach((product) => {
    const result = db
      .prepare(`
      INSERT INTO products (sku, name, description, category_id, unit, purchase_price, selling_price, reorder_level, hsn_code, tax_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .run(
        product.sku,
        product.name,
        product.description,
        product.category_id,
        product.unit,
        product.purchase_price,
        product.selling_price,
        product.reorder_level,
        product.hsn_code,
        product.tax_rate,
      )

    // Initialize inventory for each product
    db.prepare(`
      INSERT INTO inventory (product_id, current_stock)
      VALUES (?, ?)
    `).run(result.lastInsertRowid, Math.floor(Math.random() * 100) + 10) // Random stock between 10-110
  })

  console.log("✅ Default data inserted successfully")
}

// Execute all setup functions
try {
  createTables()
  createIndexes()
  insertDefaultData()

  console.log("🎉 Database initialization completed successfully!")
  console.log("📍 Database location:", dbPath)
  console.log("👤 Default admin credentials:")
  console.log("   Username: admin")
  console.log("   Password: admin123")
  console.log("")
  console.log("⚠️  IMPORTANT: Change the default password after first login!")
} catch (error) {
  console.error("❌ Database initialization failed:", error)
  process.exit(1)
} finally {
  db.close()
}
