"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = getAllProducts;
exports.createProduct = createProduct;
exports.updateStock = updateStock;
exports.getStockMovements = getStockMovements;
exports.getLowStockProducts = getLowStockProducts;
exports.getAllCategories = getAllCategories;
exports.generateSKU = generateSKU;
var database_1 = require("./database");
function getAllProducts(filters) {
    var _a;
    try {
        var db = (0, database_1.getDatabase)();
        var query = "\n      SELECT \n        p.*,\n        c.name as category_name,\n        COALESCE(i.current_stock, 0) as current_stock,\n        COALESCE(i.reserved_stock, 0) as reserved_stock\n      FROM products p\n      LEFT JOIN categories c ON p.category_id = c.id\n      LEFT JOIN inventory i ON p.id = i.product_id\n      WHERE p.is_active = 1\n    ";
        var params = [];
        if ((filters === null || filters === void 0 ? void 0 : filters.category) && filters.category !== "all") {
            query += " AND c.name = ?";
            params.push(filters.category);
        }
        if (filters === null || filters === void 0 ? void 0 : filters.search) {
            query += " AND (p.name LIKE ? OR p.sku LIKE ?)";
            params.push("%".concat(filters.search, "%"), "%".concat(filters.search, "%"));
        }
        if (filters === null || filters === void 0 ? void 0 : filters.lowStock) {
            query += " AND COALESCE(i.current_stock, 0) <= p.reorder_level";
        }
        query += " ORDER BY p.name";
        return (_a = db.prepare(query)).all.apply(_a, params);
    }
    catch (error) {
        console.error("Get products error:", error);
        return [];
    }
}
function createProduct(productData) {
    try {
        var db = (0, database_1.getDatabase)();
        // Check if SKU already exists
        var existingSku = db.prepare("SELECT id FROM products WHERE sku = ?").get(productData.sku);
        if (existingSku) {
            return { success: false, message: "SKU already exists" };
        }
        // Insert product
        var result = db
            .prepare("\n      INSERT INTO products (\n        sku, name, description, category_id, unit, \n        purchase_price, selling_price, reorder_level, \n        barcode, hsn_code, tax_rate\n      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    ")
            .run(productData.sku, productData.name, productData.description, productData.category_id, productData.unit, productData.purchase_price, productData.selling_price, productData.reorder_level, productData.barcode, productData.hsn_code, productData.tax_rate);
        var productId = result.lastInsertRowid;
        // Initialize inventory record
        db.prepare("\n      INSERT INTO inventory (product_id, current_stock, reserved_stock)\n      VALUES (?, 0, 0)\n    ").run(productId);
        // Get the created product
        var newProduct = db
            .prepare("\n      SELECT \n        p.*,\n        c.name as category_name,\n        COALESCE(i.current_stock, 0) as current_stock,\n        COALESCE(i.reserved_stock, 0) as reserved_stock\n      FROM products p\n      LEFT JOIN categories c ON p.category_id = c.id\n      LEFT JOIN inventory i ON p.id = i.product_id\n      WHERE p.id = ?\n    ")
            .get(productId);
        return {
            success: true,
            message: "Product created successfully",
            product: newProduct,
        };
    }
    catch (error) {
        console.error("Create product error:", error);
        return { success: false, message: "Failed to create product" };
    }
}
function updateStock(productId, quantity, movementType, referenceType, referenceId, notes, userId) {
    try {
        var db_1 = (0, database_1.getDatabase)();
        // Start transaction
        var transaction = db_1.transaction(function () {
            // Get current stock
            var inventory = db_1.prepare("SELECT current_stock FROM inventory WHERE product_id = ?").get(productId);
            if (!inventory) {
                throw new Error("Product not found in inventory");
            }
            var newStock = inventory.current_stock;
            // Calculate new stock based on movement type
            switch (movementType) {
                case "IN":
                    newStock += quantity;
                    break;
                case "OUT":
                    newStock -= quantity;
                    if (newStock < 0) {
                        throw new Error("Insufficient stock");
                    }
                    break;
                case "ADJUSTMENT":
                    newStock = quantity;
                    break;
            }
            // Update inventory
            db_1.prepare("\n        UPDATE inventory \n        SET current_stock = ?, last_updated = CURRENT_TIMESTAMP \n        WHERE product_id = ?\n      ").run(newStock, productId);
            // Record stock movement
            db_1.prepare("\n        INSERT INTO stock_movements (\n          product_id, movement_type, quantity, reference_type, \n          reference_id, notes, created_by\n        ) VALUES (?, ?, ?, ?, ?, ?, ?)\n      ").run(productId, movementType, quantity, referenceType, referenceId, notes, userId);
        });
        transaction();
        return { success: true, message: "Stock updated successfully" };
    }
    catch (error) {
        console.error("Update stock error:", error);
        return { success: false, message: error instanceof Error ? error.message : "Failed to update stock" };
    }
}
function getStockMovements(productId, limit) {
    var _a;
    if (limit === void 0) { limit = 100; }
    try {
        var db = (0, database_1.getDatabase)();
        var query = "\n      SELECT \n        sm.*,\n        p.name as product_name\n      FROM stock_movements sm\n      JOIN products p ON sm.product_id = p.id\n    ";
        var params = [];
        if (productId) {
            query += " WHERE sm.product_id = ?";
            params.push(productId);
        }
        query += " ORDER BY sm.created_at DESC LIMIT ?";
        params.push(limit);
        return (_a = db.prepare(query)).all.apply(_a, params);
    }
    catch (error) {
        console.error("Get stock movements error:", error);
        return [];
    }
}
function getLowStockProducts() {
    try {
        var db = (0, database_1.getDatabase)();
        return db
            .prepare("\n      SELECT \n        p.*,\n        c.name as category_name,\n        COALESCE(i.current_stock, 0) as current_stock,\n        COALESCE(i.reserved_stock, 0) as reserved_stock\n      FROM products p\n      LEFT JOIN categories c ON p.category_id = c.id\n      LEFT JOIN inventory i ON p.id = i.product_id\n      WHERE p.is_active = 1 \n        AND COALESCE(i.current_stock, 0) <= p.reorder_level\n      ORDER BY (COALESCE(i.current_stock, 0) - p.reorder_level) ASC\n    ")
            .all();
    }
    catch (error) {
        console.error("Get low stock products error:", error);
        return [];
    }
}
function getAllCategories() {
    try {
        var db = (0, database_1.getDatabase)();
        return db
            .prepare("\n      SELECT * FROM categories \n      WHERE is_active = 1 \n      ORDER BY name\n    ")
            .all();
    }
    catch (error) {
        console.error("Get categories error:", error);
        return [];
    }
}
function generateSKU(categoryName, productName) {
    // Generate SKU based on category and product name
    var categoryCode = categoryName.substring(0, 3).toUpperCase();
    var productCode = productName
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 3)
        .toUpperCase();
    var timestamp = Date.now().toString().slice(-4);
    return "".concat(categoryCode).concat(productCode).concat(timestamp);
}
