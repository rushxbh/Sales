import { getDatabase } from "./database"
import { updateStock } from "./inventory"

export interface Customer {
  id: number
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  gst_number?: string
  credit_limit: number
  payment_terms: number
  is_active: boolean
  created_at: string
}

export interface Invoice {
  id: number
  invoice_number: string
  customer_id: number
  customer_name?: string
  invoice_date: string
  due_date?: string
  subtotal: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  status: "Pending" | "Paid" | "Overdue" | "Cancelled"
  created_by: number
  created_at: string
}

export interface InvoiceItem {
  id: number
  invoice_id: number
  product_id: number
  product_name?: string
  sku?: string
  quantity: number
  unit_price: number
  discount_percent: number
  tax_rate: number
  total_price: number
}

export interface Payment {
  id: number
  invoice_id: number
  amount: number
  payment_method: string
  payment_date: string
  reference_number?: string
  notes?: string
  created_by: number
  created_at: string
}

export function getAllCustomers(): Customer[] {
  try {
    const db = getDatabase()

    return db
      .prepare(`
      SELECT * FROM customers 
      WHERE is_active = 1 
      ORDER BY name
    `)
      .all() as Customer[]
  } catch (error) {
    console.error("Get customers error:", error)
    return []
  }
}

export function createCustomer(customerData: Omit<Customer, "id" | "created_at">): {
  success: boolean
  message: string
  customer?: Customer
} {
  try {
    const db = getDatabase()

    const result = db
      .prepare(`
      INSERT INTO customers (
        name, contact_person, phone, email, address, 
        gst_number, credit_limit, payment_terms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .run(
        customerData.name,
        customerData.contact_person,
        customerData.phone,
        customerData.email,
        customerData.address,
        customerData.gst_number,
        customerData.credit_limit,
        customerData.payment_terms,
      )

    const newCustomer = db.prepare("SELECT * FROM customers WHERE id = ?").get(result.lastInsertRowid) as Customer

    return {
      success: true,
      message: "Customer created successfully",
      customer: newCustomer,
    }
  } catch (error) {
    console.error("Create customer error:", error)
    return { success: false, message: "Failed to create customer" }
  }
}

export function getAllInvoices(filters?: {
  status?: string
  customerId?: number
  fromDate?: string
  toDate?: string
}): Invoice[] {
  try {
    const db = getDatabase()

    let query = `
      SELECT 
        i.*,
        c.name as customer_name
      FROM sales_invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE 1=1
    `

    const params: any[] = []

    if (filters?.status && filters.status !== "all") {
      query += " AND i.status = ?"
      params.push(filters.status)
    }

    if (filters?.customerId) {
      query += " AND i.customer_id = ?"
      params.push(filters.customerId)
    }

    if (filters?.fromDate) {
      query += " AND i.invoice_date >= ?"
      params.push(filters.fromDate)
    }

    if (filters?.toDate) {
      query += " AND i.invoice_date <= ?"
      params.push(filters.toDate)
    }

    query += " ORDER BY i.created_at DESC"

    return db.prepare(query).all(...params) as Invoice[]
  } catch (error) {
    console.error("Get invoices error:", error)
    return []
  }
}

export function createInvoice(invoiceData: {
  customer_id: number
  invoice_date: string
  due_date?: string
  items: Array<{
    product_id: number
    quantity: number
    unit_price: number
    discount_percent?: number
    tax_rate: number
  }>
  created_by: number
}): { success: boolean; message: string; invoice?: Invoice } {
  try {
    const db = getDatabase()

    // Generate invoice number
    const lastInvoice = db.prepare("SELECT invoice_number FROM sales_invoices ORDER BY id DESC LIMIT 1").get() as
      | { invoice_number: string }
      | undefined
    let invoiceNumber = "INV0001"

    if (lastInvoice) {
      const lastNumber = Number.parseInt(lastInvoice.invoice_number.replace("INV", ""))
      invoiceNumber = `INV${(lastNumber + 1).toString().padStart(4, "0")}`
    }

    // Calculate totals
    let subtotal = 0
    let taxAmount = 0

    const processedItems = invoiceData.items.map((item) => {
      const lineTotal = item.quantity * item.unit_price
      const discountAmount = (lineTotal * (item.discount_percent || 0)) / 100
      const discountedAmount = lineTotal - discountAmount
      const lineTax = (discountedAmount * item.tax_rate) / 100
      const finalTotal = discountedAmount + lineTax

      subtotal += discountedAmount
      taxAmount += lineTax

      return {
        ...item,
        total_price: finalTotal,
      }
    })

    const totalAmount = subtotal + taxAmount

    // Start transaction
    const transaction = db.transaction(() => {
      // Insert invoice
      const invoiceResult = db
        .prepare(`
        INSERT INTO sales_invoices (
          invoice_number, customer_id, invoice_date, due_date,
          subtotal, tax_amount, total_amount, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
        .run(
          invoiceNumber,
          invoiceData.customer_id,
          invoiceData.invoice_date,
          invoiceData.due_date,
          subtotal,
          taxAmount,
          totalAmount,
          invoiceData.created_by,
        )

      const invoiceId = invoiceResult.lastInsertRowid as number

      // Insert invoice items and update stock
      processedItems.forEach((item) => {
        db.prepare(`
          INSERT INTO sales_invoice_items (
            invoice_id, product_id, quantity, unit_price,
            discount_percent, tax_rate, total_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          invoiceId,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.discount_percent || 0,
          item.tax_rate,
          item.total_price,
        )

        // Update stock (reduce inventory)
        const stockResult = updateStock(
          item.product_id,
          item.quantity,
          "OUT",
          "INVOICE",
          invoiceId,
          `Sale - Invoice ${invoiceNumber}`,
          invoiceData.created_by,
        )

        if (!stockResult.success) {
          throw new Error(stockResult.message)
        }
      })
    })

    transaction()

    // Get the created invoice
    const newInvoice = db
      .prepare(`
      SELECT 
        i.*,
        c.name as customer_name
      FROM sales_invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `)
      .get(invoiceId) as Invoice

    return {
      success: true,
      message: "Invoice created successfully",
      invoice: newInvoice,
    }
  } catch (error) {
    console.error("Create invoice error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Failed to create invoice" }
  }
}

export function getInvoiceDetails(invoiceId: number): { invoice?: Invoice; items: InvoiceItem[] } {
  try {
    const db = getDatabase()

    const invoice = db
      .prepare(`
      SELECT 
        i.*,
        c.name as customer_name
      FROM sales_invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `)
      .get(invoiceId) as Invoice | undefined

    const items = db
      .prepare(`
      SELECT 
        ii.*,
        p.name as product_name,
        p.sku
      FROM sales_invoice_items ii
      JOIN products p ON ii.product_id = p.id
      WHERE ii.invoice_id = ?
    `)
      .all(invoiceId) as InvoiceItem[]

    return { invoice, items }
  } catch (error) {
    console.error("Get invoice details error:", error)
    return { items: [] }
  }
}

export function recordPayment(paymentData: Omit<Payment, "id" | "created_at">): {
  success: boolean
  message: string
  payment?: Payment
} {
  try {
    const db = getDatabase()

    // Start transaction
    const transaction = db.transaction(() => {
      // Insert payment
      const result = db
        .prepare(`
        INSERT INTO payments (
          invoice_id, amount, payment_method, payment_date,
          reference_number, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
        .run(
          paymentData.invoice_id,
          paymentData.amount,
          paymentData.payment_method,
          paymentData.payment_date,
          paymentData.reference_number,
          paymentData.notes,
          paymentData.created_by,
        )

      // Update invoice paid amount
      db.prepare(`
        UPDATE sales_invoices 
        SET paid_amount = paid_amount + ?,
            status = CASE 
              WHEN paid_amount + ? >= total_amount THEN 'Paid'
              ELSE 'Pending'
            END
        WHERE id = ?
      `).run(paymentData.amount, paymentData.amount, paymentData.invoice_id)

      return result.lastInsertRowid
    })

    const paymentId = transaction()

    const newPayment = db.prepare("SELECT * FROM payments WHERE id = ?").get(paymentId) as Payment

    return {
      success: true,
      message: "Payment recorded successfully",
      payment: newPayment,
    }
  } catch (error) {
    console.error("Record payment error:", error)
    return { success: false, message: "Failed to record payment" }
  }
}

export function getSalesReport(
  fromDate: string,
  toDate: string,
): {
  totalSales: number
  totalInvoices: number
  paidAmount: number
  pendingAmount: number
  topProducts: Array<{ product_name: string; quantity: number; revenue: number }>
  dailySales: Array<{ date: string; amount: number }>
} {
  try {
    const db = getDatabase()

    // Get summary data
    const summary = db
      .prepare(`
      SELECT 
        COUNT(*) as total_invoices,
        SUM(total_amount) as total_sales,
        SUM(paid_amount) as paid_amount,
        SUM(total_amount - paid_amount) as pending_amount
      FROM sales_invoices
      WHERE invoice_date BETWEEN ? AND ?
    `)
      .get(fromDate, toDate) as any

    // Get top products
    const topProducts = db
      .prepare(`
      SELECT 
        p.name as product_name,
        SUM(ii.quantity) as quantity,
        SUM(ii.total_price) as revenue
      FROM sales_invoice_items ii
      JOIN products p ON ii.product_id = p.id
      JOIN sales_invoices i ON ii.invoice_id = i.id
      WHERE i.invoice_date BETWEEN ? AND ?
      GROUP BY ii.product_id, p.name
      ORDER BY revenue DESC
      LIMIT 10
    `)
      .all(fromDate, toDate) as any[]

    // Get daily sales
    const dailySales = db
      .prepare(`
      SELECT 
        invoice_date as date,
        SUM(total_amount) as amount
      FROM sales_invoices
      WHERE invoice_date BETWEEN ? AND ?
      GROUP BY invoice_date
      ORDER BY invoice_date
    `)
      .all(fromDate, toDate) as any[]

    return {
      totalSales: summary?.total_sales || 0,
      totalInvoices: summary?.total_invoices || 0,
      paidAmount: summary?.paid_amount || 0,
      pendingAmount: summary?.pending_amount || 0,
      topProducts: topProducts || [],
      dailySales: dailySales || [],
    }
  } catch (error) {
    console.error("Get sales report error:", error)
    return {
      totalSales: 0,
      totalInvoices: 0,
      paidAmount: 0,
      pendingAmount: 0,
      topProducts: [],
      dailySales: [],
    }
  }
}
