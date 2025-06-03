import PDFDocument from "pdfkit"
import fs from "fs"
import type { Invoice, InvoiceItem } from "./sales"
import { getDatabase } from "./database"

export interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  gst_number: string
}

export function generateInvoicePDF(
  invoice: Invoice,
  items: InvoiceItem[],
  companyInfo: CompanyInfo,
  outputPath: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const stream = fs.createWriteStream(outputPath)
      doc.pipe(stream)

      // Header
      doc.fontSize(20).text(companyInfo.name, 50, 50)
      doc
        .fontSize(10)
        .text(companyInfo.address, 50, 80)
        .text(`Phone: ${companyInfo.phone}`, 50, 95)
        .text(`Email: ${companyInfo.email}`, 50, 110)
        .text(`GST: ${companyInfo.gst_number}`, 50, 125)

      // Invoice title
      doc.fontSize(24).text("INVOICE", 400, 50)

      // Invoice details
      doc
        .fontSize(10)
        .text(`Invoice No: ${invoice.invoice_number}`, 400, 80)
        .text(`Date: ${invoice.invoice_date}`, 400, 95)
        .text(`Due Date: ${invoice.due_date || "N/A"}`, 400, 110)

      // Customer details
      doc.text("Bill To:", 50, 160)
      doc.fontSize(12).text(invoice.customer_name || "Customer", 50, 180)

      // Table header
      const tableTop = 250
      doc
        .fontSize(10)
        .text("Item", 50, tableTop)
        .text("Qty", 200, tableTop)
        .text("Rate", 250, tableTop)
        .text("Discount", 300, tableTop)
        .text("Tax", 350, tableTop)
        .text("Amount", 450, tableTop)

      // Draw line under header
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke()

      // Table rows
      let yPosition = tableTop + 30
      items.forEach((item, index) => {
        doc
          .text(item.product_name || "Product", 50, yPosition)
          .text(item.quantity.toString(), 200, yPosition)
          .text(`₹${item.unit_price.toFixed(2)}`, 250, yPosition)
          .text(`${item.discount_percent}%`, 300, yPosition)
          .text(`${item.tax_rate}%`, 350, yPosition)
          .text(`₹${item.total_price.toFixed(2)}`, 450, yPosition)

        yPosition += 20
      })

      // Totals
      const totalsY = yPosition + 30
      doc
        .moveTo(350, totalsY - 10)
        .lineTo(550, totalsY - 10)
        .stroke()

      doc
        .text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, 350, totalsY)
        .text(`Tax: ₹${invoice.tax_amount.toFixed(2)}`, 350, totalsY + 15)
        .text(`Total: ₹${invoice.total_amount.toFixed(2)}`, 350, totalsY + 30)
        .text(`Paid: ₹${invoice.paid_amount.toFixed(2)}`, 350, totalsY + 45)
        .text(`Balance: ₹${(invoice.total_amount - invoice.paid_amount).toFixed(2)}`, 350, totalsY + 60)

      // Footer
      doc
        .fontSize(8)
        .text("Thank you for your business!", 50, doc.page.height - 100)
        .text("This is a computer generated invoice.", 50, doc.page.height - 85)

      doc.end()

      stream.on("finish", () => {
        resolve(outputPath)
      })

      stream.on("error", (error) => {
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}

export function generateStockReport(outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase()

      const products = db
        .prepare(`
        SELECT 
          p.sku,
          p.name,
          c.name as category_name,
          p.unit,
          COALESCE(i.current_stock, 0) as current_stock,
          p.reorder_level,
          p.selling_price,
          (COALESCE(i.current_stock, 0) * p.selling_price) as stock_value
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE p.is_active = 1
        ORDER BY p.name
      `)
        .all() as any[]

      const doc = new PDFDocument({ margin: 50 })
      const stream = fs.createWriteStream(outputPath)
      doc.pipe(stream)

      // Header
      doc.fontSize(18).text("Stock Report", 50, 50)
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80)

      // Table header
      const tableTop = 120
      doc
        .fontSize(8)
        .text("SKU", 50, tableTop)
        .text("Product Name", 100, tableTop)
        .text("Category", 200, tableTop)
        .text("Stock", 270, tableTop)
        .text("Unit", 310, tableTop)
        .text("Reorder", 350, tableTop)
        .text("Price", 400, tableTop)
        .text("Value", 450, tableTop)

      // Draw line under header
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke()

      // Table rows
      let yPosition = tableTop + 25
      let totalValue = 0

      products.forEach((product) => {
        if (yPosition > 700) {
          doc.addPage()
          yPosition = 50
        }

        const stockColor = product.current_stock <= product.reorder_level ? "red" : "black"

        doc
          .fillColor("black")
          .text(product.sku, 50, yPosition)
          .text(product.name.substring(0, 20), 100, yPosition)
          .text(product.category_name, 200, yPosition)
          .fillColor(stockColor)
          .text(product.current_stock.toString(), 270, yPosition)
          .fillColor("black")
          .text(product.unit, 310, yPosition)
          .text(product.reorder_level.toString(), 350, yPosition)
          .text(`₹${product.selling_price.toFixed(2)}`, 400, yPosition)
          .text(`₹${product.stock_value.toFixed(2)}`, 450, yPosition)

        totalValue += product.stock_value
        yPosition += 15
      })

      // Total
      doc
        .moveTo(400, yPosition + 10)
        .lineTo(550, yPosition + 10)
        .stroke()
      doc.fontSize(10).text(`Total Stock Value: ₹${totalValue.toFixed(2)}`, 400, yPosition + 20)

      doc.end()

      stream.on("finish", () => {
        resolve(outputPath)
      })

      stream.on("error", (error) => {
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}
