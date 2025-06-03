"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
exports.backupDatabase = backupDatabase;
exports.restoreDatabase = restoreDatabase;
var better_sqlite3_1 = require("better-sqlite3");
var path_1 = require("path");
var electron_1 = require("electron");
var fs_1 = require("fs");
var logger_1 = require("./logger");
// Database connection
var db = null;
function initDatabase() {
    try {
        var userDataPath = electron_1.app.getPath("userData");
        var dbDir = path_1.default.join(userDataPath, "database");
        // Ensure database directory exists
        if (!fs_1.default.existsSync(dbDir)) {
            fs_1.default.mkdirSync(dbDir, { recursive: true });
        }
        var dbPath = path_1.default.join(dbDir, "inventory.db");
        db = new better_sqlite3_1.default(dbPath);
        // Enable foreign keys and WAL mode for better performance
        db.pragma("foreign_keys = ON");
        db.pragma("journal_mode = WAL");
        db.pragma("synchronous = NORMAL");
        db.pragma("cache_size = 1000");
        db.pragma("temp_store = memory");
        logger_1.logger.info("Database initialized at: ".concat(dbPath));
        // Create tables
        createTables();
        // Insert default data
        insertDefaultData();
        return db;
    }
    catch (error) {
        logger_1.logger.error("Failed to initialize database:", error);
        throw error;
    }
}
function getDatabase() {
    if (!db) {
        throw new Error("Database not initialized. Call initDatabase() first.");
    }
    return db;
}
function createTables() {
    if (!db)
        return;
    try {
        // Users table
        db.exec("\n      CREATE TABLE IF NOT EXISTS users (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        username VARCHAR(50) UNIQUE NOT NULL,\n        password_hash VARCHAR(255) NOT NULL,\n        full_name VARCHAR(100) NOT NULL,\n        role VARCHAR(20) NOT NULL DEFAULT 'Sales',\n        email VARCHAR(100),\n        is_active BOOLEAN DEFAULT 1,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        last_login DATETIME,\n        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n      )\n    ");
        // Categories table
        db.exec("\n      CREATE TABLE IF NOT EXISTS categories (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        name VARCHAR(50) UNIQUE NOT NULL,\n        description TEXT,\n        is_active BOOLEAN DEFAULT 1,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n      )\n    ");
        // Suppliers table
        db.exec("\n      CREATE TABLE IF NOT EXISTS suppliers (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        name VARCHAR(100) NOT NULL,\n        contact_person VARCHAR(100),\n        phone VARCHAR(20),\n        email VARCHAR(100),\n        address TEXT,\n        gst_number VARCHAR(15),\n        payment_terms INTEGER DEFAULT 30,\n        is_active BOOLEAN DEFAULT 1,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n      )\n    ");
        // Products table
        db.exec("\n      CREATE TABLE IF NOT EXISTS products (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        sku VARCHAR(50) UNIQUE NOT NULL,\n        name VARCHAR(200) NOT NULL,\n        description TEXT,\n        category_id INTEGER,\n        unit VARCHAR(20) NOT NULL,\n        purchase_price DECIMAL(10,2) DEFAULT 0,\n        selling_price DECIMAL(10,2) NOT NULL,\n        reorder_level INTEGER DEFAULT 0,\n        barcode VARCHAR(50),\n        hsn_code VARCHAR(10),\n        tax_rate DECIMAL(5,2) DEFAULT 18.00,\n        is_active BOOLEAN DEFAULT 1,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        FOREIGN KEY (category_id) REFERENCES categories(id)\n      )\n    ");
        // Inventory table
        db.exec("\n      CREATE TABLE IF NOT EXISTS inventory (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        product_id INTEGER UNIQUE,\n        current_stock DECIMAL(10,2) DEFAULT 0,\n        reserved_stock DECIMAL(10,2) DEFAULT 0,\n        location VARCHAR(50) DEFAULT 'Main Store',\n        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,\n        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE\n      )\n    ");
        // Customers table
        db.exec("\n      CREATE TABLE IF NOT EXISTS customers (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        name VARCHAR(100) NOT NULL,\n        contact_person VARCHAR(100),\n        phone VARCHAR(20),\n        email VARCHAR(100),\n        address TEXT,\n        gst_number VARCHAR(15),\n        credit_limit DECIMAL(10,2) DEFAULT 0,\n        payment_terms INTEGER DEFAULT 0,\n        is_active BOOLEAN DEFAULT 1,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n      )\n    ");
        // Sales invoices table
        db.exec("\n      CREATE TABLE IF NOT EXISTS sales_invoices (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        invoice_number VARCHAR(50) UNIQUE NOT NULL,\n        customer_id INTEGER,\n        invoice_date DATE NOT NULL,\n        due_date DATE,\n        subtotal DECIMAL(12,2) DEFAULT 0,\n        tax_amount DECIMAL(10,2) DEFAULT 0,\n        total_amount DECIMAL(12,2) DEFAULT 0,\n        paid_amount DECIMAL(12,2) DEFAULT 0,\n        status VARCHAR(20) DEFAULT 'Pending',\n        notes TEXT,\n        created_by INTEGER,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        FOREIGN KEY (customer_id) REFERENCES customers(id),\n        FOREIGN KEY (created_by) REFERENCES users(id)\n      )\n    ");
        // Sales invoice items table
        db.exec("\n      CREATE TABLE IF NOT EXISTS sales_invoice_items (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        invoice_id INTEGER,\n        product_id INTEGER,\n        quantity DECIMAL(10,2) NOT NULL,\n        unit_price DECIMAL(10,2) NOT NULL,\n        discount_percent DECIMAL(5,2) DEFAULT 0,\n        tax_rate DECIMAL(5,2) NOT NULL,\n        total_price DECIMAL(12,2) NOT NULL,\n        FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE,\n        FOREIGN KEY (product_id) REFERENCES products(id)\n      )\n    ");
        // Purchase orders table
        db.exec("\n      CREATE TABLE IF NOT EXISTS purchase_orders (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        po_number VARCHAR(50) UNIQUE NOT NULL,\n        supplier_id INTEGER,\n        po_date DATE NOT NULL,\n        expected_delivery DATE,\n        total_amount DECIMAL(12,2) DEFAULT 0,\n        status VARCHAR(20) DEFAULT 'Pending',\n        notes TEXT,\n        created_by INTEGER,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),\n        FOREIGN KEY (created_by) REFERENCES users(id)\n      )\n    ");
        // Purchase order items table
        db.exec("\n      CREATE TABLE IF NOT EXISTS purchase_order_items (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        po_id INTEGER,\n        product_id INTEGER,\n        quantity DECIMAL(10,2) NOT NULL,\n        unit_price DECIMAL(10,2) NOT NULL,\n        total_price DECIMAL(12,2) NOT NULL,\n        received_quantity DECIMAL(10,2) DEFAULT 0,\n        FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,\n        FOREIGN KEY (product_id) REFERENCES products(id)\n      )\n    ");
        // Stock movements table
        db.exec("\n      CREATE TABLE IF NOT EXISTS stock_movements (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        product_id INTEGER,\n        movement_type VARCHAR(20) NOT NULL,\n        quantity DECIMAL(10,2) NOT NULL,\n        reference_type VARCHAR(20),\n        reference_id INTEGER,\n        notes TEXT,\n        created_by INTEGER,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        FOREIGN KEY (product_id) REFERENCES products(id),\n        FOREIGN KEY (created_by) REFERENCES users(id)\n      )\n    ");
        // Payments table
        db.exec("\n      CREATE TABLE IF NOT EXISTS payments (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        invoice_id INTEGER,\n        amount DECIMAL(10,2) NOT NULL,\n        payment_method VARCHAR(20) NOT NULL,\n        payment_date DATE NOT NULL,\n        reference_number VARCHAR(50),\n        notes TEXT,\n        created_by INTEGER,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id),\n        FOREIGN KEY (created_by) REFERENCES users(id)\n      )\n    ");
        // Settings table
        db.exec("\n      CREATE TABLE IF NOT EXISTS settings (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        key VARCHAR(50) UNIQUE NOT NULL,\n        value TEXT,\n        description TEXT,\n        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n      )\n    ");
        // Audit log table
        db.exec("\n      CREATE TABLE IF NOT EXISTS audit_log (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        user_id INTEGER,\n        action VARCHAR(50) NOT NULL,\n        table_name VARCHAR(50),\n        record_id INTEGER,\n        old_values TEXT,\n        new_values TEXT,\n        ip_address VARCHAR(45),\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        FOREIGN KEY (user_id) REFERENCES users(id)\n      )\n    ");
        // Quotations table
        db.exec("\n      CREATE TABLE IF NOT EXISTS quotations (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        quote_number VARCHAR(50) UNIQUE NOT NULL,\n        customer_id INTEGER,\n        quote_date DATE NOT NULL,\n        valid_until DATE,\n        subtotal DECIMAL(12,2) DEFAULT 0,\n        tax_amount DECIMAL(10,2) DEFAULT 0,\n        total_amount DECIMAL(12,2) DEFAULT 0,\n        status VARCHAR(20) DEFAULT 'Draft',\n        notes TEXT,\n        terms_conditions TEXT,\n        created_by INTEGER,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        FOREIGN KEY (customer_id) REFERENCES customers(id),\n        FOREIGN KEY (created_by) REFERENCES users(id)\n      )\n    ");
        // Quotation items table
        db.exec("\n      CREATE TABLE IF NOT EXISTS quotation_items (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        quote_id INTEGER,\n        product_id INTEGER,\n        quantity DECIMAL(10,2) NOT NULL,\n        unit_price DECIMAL(10,2) NOT NULL,\n        discount_percent DECIMAL(5,2) DEFAULT 0,\n        tax_rate DECIMAL(5,2) NOT NULL,\n        total_price DECIMAL(12,2) NOT NULL,\n        FOREIGN KEY (quote_id) REFERENCES quotations(id) ON DELETE CASCADE,\n        FOREIGN KEY (product_id) REFERENCES products(id)\n      )\n    ");
        // Create indexes for better performance
        createIndexes();
        logger_1.logger.info("Database tables created successfully");
    }
    catch (error) {
        logger_1.logger.error("Failed to create database tables:", error);
        throw error;
    }
}
function createIndexes() {
    if (!db)
        return;
    try {
        // Create indexes for frequently queried columns
        var indexes = [
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
        ];
        indexes.forEach(function (indexSql) {
            db.exec(indexSql);
        });
        logger_1.logger.info("Database indexes created successfully");
    }
    catch (error) {
        logger_1.logger.error("Failed to create database indexes:", error);
    }
}
function insertDefaultData() {
    if (!db)
        return;
    try {
        // Check if admin user exists
        var adminExists = db.prepare("SELECT COUNT(*) as count FROM users WHERE username = ?").get("admin");
        if (adminExists.count === 0) {
            var bcrypt = require("bcrypt");
            var hashedPassword = bcrypt.hashSync("admin123", 10);
            db.prepare("\n        INSERT INTO users (username, password_hash, full_name, role, email)\n        VALUES (?, ?, ?, ?, ?)\n      ").run("admin", hashedPassword, "System Administrator", "Admin", "admin@company.com");
            logger_1.logger.info("Default admin user created");
        }
        // Insert default categories
        var categories = [
            { name: "Plywood", description: "All types of plywood sheets and boards" },
            { name: "Laminates", description: "Decorative laminates and veneers" },
            { name: "Hardware", description: "Furniture hardware and fittings" },
            { name: "Edge Bands", description: "PVC and wood edge banding materials" },
            { name: "Adhesives", description: "Glues, adhesives and bonding materials" },
            { name: "Tools", description: "Hand tools and power tools" },
            { name: "Accessories", description: "Miscellaneous accessories and supplies" },
        ];
        categories.forEach(function (category) {
            db
                .prepare("\n        INSERT OR IGNORE INTO categories (name, description)\n        VALUES (?, ?)\n      ")
                .run(category.name, category.description);
        });
        // Insert default settings
        var defaultSettings = [
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
        ];
        defaultSettings.forEach(function (setting) {
            db
                .prepare("\n        INSERT OR IGNORE INTO settings (key, value, description)\n        VALUES (?, ?, ?)\n      ")
                .run(setting.key, setting.value, setting.description);
        });
        logger_1.logger.info("Default data inserted successfully");
    }
    catch (error) {
        logger_1.logger.error("Failed to insert default data:", error);
    }
}
function closeDatabase() {
    if (db) {
        try {
            db.close();
            db = null;
            logger_1.logger.info("Database connection closed");
        }
        catch (error) {
            logger_1.logger.error("Error closing database:", error);
        }
    }
}
function backupDatabase(backupPath) {
    if (!db)
        return false;
    try {
        var backup = db.backup(backupPath);
        backup.step(-1); // Copy entire database
        backup.finish();
        logger_1.logger.info("Database backed up to: ".concat(backupPath));
        return true;
    }
    catch (error) {
        logger_1.logger.error("Database backup failed:", error);
        return false;
    }
}
function restoreDatabase(backupPath) {
    try {
        if (!fs_1.default.existsSync(backupPath)) {
            logger_1.logger.error("Backup file not found: ".concat(backupPath));
            return false;
        }
        // Close current database
        closeDatabase();
        // Copy backup file to current database location
        var userDataPath = electron_1.app.getPath("userData");
        var dbPath = path_1.default.join(userDataPath, "database", "inventory.db");
        fs_1.default.copyFileSync(backupPath, dbPath);
        // Reinitialize database
        initDatabase();
        logger_1.logger.info("Database restored from: ".concat(backupPath));
        return true;
    }
    catch (error) {
        logger_1.logger.error("Database restore failed:", error);
        return false;
    }
}
