import { getDatabase } from "./database"

export interface Product {
  id: number
  sku: string
  name: string
  description?: string
  category_id: number
  category_name?: string
  unit: string
  purchase_price: number
  selling_price: number
  reorder_level: number
  current_stock: number
  reserved_stock: number
  barcode?: string
  hsn_code?: string
  tax_rate: number
  is_active: boolean
  created_at: string
}

export interface StockMovement {
  id: number
  product_id: number
  product_name: string
  movement_type: "IN" | "OUT" | "ADJUSTMENT"
  quantity: number
  reference_type?: string
  reference_id?: number
  notes?: string
  created_by: number
  created_at: string
}

export interface Category {
  id: number
  name: string
  description?: string
  is_active: boolean
}

export function getAllProducts(filters?: {
  category?: string
  search?: string
  lowStock?: boolean
}): Product[] {
  try {
    const db = getDatabase()

    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE(i.current_stock, 0) as current_stock,
        COALESCE(i.reserved_stock, 0) as reserved_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = 1
    `

    const params: any[] = []

    if (filters?.category && filters.category !== "all") {
      query += " AND c.name = ?"
      params.push(filters.category)
    }

    if (filters?.search) {
      query += " AND (p.name LIKE ? OR p.sku LIKE ?)"
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    if (filters?.lowStock) {
      query += " AND COALESCE(i.current_stock, 0) <= p.reorder_level"
    }

    query += " ORDER BY p.name"

    return db.prepare(query).all(...params) as Product[]
  } catch (error) {
    console.error("Get products error:", error)
    return []
  }
}

export function createProduct(productData: Omit<Product, "id" | "created_at" | "current_stock" | "reserved_stock">): {
  success: boolean
  message: string
  product?: Product
} {
  try {
    const db = getDatabase()

    // Check if SKU already exists
    const existingSku = db.prepare("SELECT id FROM products WHERE sku = ?").get(productData.sku)

    if (existingSku) {
      return { success: false, message: "SKU already exists" }
    }

    // Insert product
    const result = db
      .prepare(`
      INSERT INTO products (
        sku, name, description, category_id, unit, 
        purchase_price, selling_price, reorder_level, 
        barcode, hsn_code, tax_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .run(
        productData.sku,
        productData.name,
        productData.description,
        productData.category_id,
        productData.unit,
        productData.purchase_price,
        productData.selling_price,
        productData.reorder_level,
        productData.barcode,
        productData.hsn_code,
        productData.tax_rate,
      )

    const productId = result.lastInsertRowid as number

    // Initialize inventory record
    db.prepare(`
      INSERT INTO inventory (product_id, current_stock, reserved_stock)
      VALUES (?, 0, 0)
    `).run(productId)

    // Get the created product
    const newProduct = db
      .prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE(i.current_stock, 0) as current_stock,
        COALESCE(i.reserved_stock, 0) as reserved_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = ?
    `)
      .get(productId) as Product

    return {
      success: true,
      message: "Product created successfully",
      product: newProduct,
    }
  } catch (error) {
    console.error("Create product error:", error)
    return { success: false, message: "Failed to create product" }
  }
}

export function updateStock(
  productId: number,
  quantity: number,
  movementType: "IN" | "OUT" | "ADJUSTMENT",
  referenceType?: string,
  referenceId?: number,
  notes?: string,
  userId?: number,
): { success: boolean; message: string } {
  try {
    const db = getDatabase()

    // Start transaction
    const transaction = db.transaction(() => {
      // Get current stock
      const inventory = db.prepare("SELECT current_stock FROM inventory WHERE product_id = ?").get(productId) as
        | { current_stock: number }
        | undefined

      if (!inventory) {
        throw new Error("Product not found in inventory")
      }

      let newStock = inventory.current_stock

      // Calculate new stock based on movement type
      switch (movementType) {
        case "IN":
          newStock += quantity
          break
        case "OUT":
          newStock -= quantity
          if (newStock < 0) {
            throw new Error("Insufficient stock")
          }
          break
        case "ADJUSTMENT":
          newStock = quantity
          break
      }

      // Update inventory
      db.prepare(`
        UPDATE inventory 
        SET current_stock = ?, last_updated = CURRENT_TIMESTAMP 
        WHERE product_id = ?
      `).run(newStock, productId)

      // Record stock movement
      db.prepare(`
        INSERT INTO stock_movements (
          product_id, movement_type, quantity, reference_type, 
          reference_id, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(productId, movementType, quantity, referenceType, referenceId, notes, userId)
    })

    transaction()

    return { success: true, message: "Stock updated successfully" }
  } catch (error) {
    console.error("Update stock error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Failed to update stock" }
  }
}

export function getStockMovements(productId?: number, limit = 100): StockMovement[] {
  try {
    const db = getDatabase()

    let query = `
      SELECT 
        sm.*,
        p.name as product_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
    `

    const params: any[] = []

    if (productId) {
      query += " WHERE sm.product_id = ?"
      params.push(productId)
    }

    query += " ORDER BY sm.created_at DESC LIMIT ?"
    params.push(limit)

    return db.prepare(query).all(...params) as StockMovement[]
  } catch (error) {
    console.error("Get stock movements error:", error)
    return []
  }
}

export function getLowStockProducts(): Product[] {
  try {
    const db = getDatabase()

    return db
      .prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE(i.current_stock, 0) as current_stock,
        COALESCE(i.reserved_stock, 0) as reserved_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = 1 
        AND COALESCE(i.current_stock, 0) <= p.reorder_level
      ORDER BY (COALESCE(i.current_stock, 0) - p.reorder_level) ASC
    `)
      .all() as Product[]
  } catch (error) {
    console.error("Get low stock products error:", error)
    return []
  }
}

export function getAllCategories(): Category[] {
  try {
    const db = getDatabase()

    return db
      .prepare(`
      SELECT * FROM categories 
      WHERE is_active = 1 
      ORDER BY name
    `)
      .all() as Category[]
  } catch (error) {
    console.error("Get categories error:", error)
    return []
  }
}

export function generateSKU(categoryName: string, productName: string): string {
  // Generate SKU based on category and product name
  const categoryCode = categoryName.substring(0, 3).toUpperCase()
  const productCode = productName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 3)
    .toUpperCase()
  const timestamp = Date.now().toString().slice(-4)

  return `${categoryCode}${productCode}${timestamp}`
}
