"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DatabaseSchema() {
  const tables = [
    {
      name: "users",
      description: "User management and authentication",
      columns: [
        { name: "id", type: "INTEGER PRIMARY KEY", description: "Unique user identifier" },
        { name: "username", type: "VARCHAR(50) UNIQUE", description: "Login username" },
        { name: "password_hash", type: "VARCHAR(255)", description: "Hashed password" },
        { name: "full_name", type: "VARCHAR(100)", description: "Full name" },
        { name: "role", type: "VARCHAR(20)", description: "User role (Admin, Sales, Inventory)" },
        { name: "email", type: "VARCHAR(100)", description: "Email address" },
        { name: "is_active", type: "BOOLEAN DEFAULT 1", description: "Account status" },
        { name: "created_at", type: "DATETIME DEFAULT CURRENT_TIMESTAMP", description: "Creation timestamp" },
        { name: "last_login", type: "DATETIME", description: "Last login timestamp" },
      ],
    },
    {
      name: "categories",
      description: "Product categories",
      columns: [
        { name: "id", type: "INTEGER PRIMARY KEY", description: "Category ID" },
        { name: "name", type: "VARCHAR(50) UNIQUE", description: "Category name" },
        { name: "description", type: "TEXT", description: "Category description" },
        { name: "is_active", type: "BOOLEAN DEFAULT 1", description: "Active status" },
      ],
    },
    {
      name: "suppliers",
      description: "Supplier information",
      columns: [
        { name: "id", type: "INTEGER PRIMARY KEY", description: "Supplier ID" },
        { name: "name", type: "VARCHAR(100)", description: "Supplier name" },
        { name: "contact_person", type: "VARCHAR(100)", description: "Contact person" },
        { name: "phone", type: "VARCHAR(20)", description: "Phone number" },
        { name: "email", type: "VARCHAR(100)", description: "Email address" },
        { name: "address", type: "TEXT", description: "Address" },
        { name: "gst_number", type: "VARCHAR(15)", description: "GST registration number" },
        { name: "payment_terms", type: "INTEGER", description: "Payment terms in days" },
        { name: "is_active", type: "BOOLEAN DEFAULT 1", description: "Active status" },
      ],
    },
    {
      name: "products",
      description: "Product master data",
      columns: [
        { name: "id", type: "INTEGER PRIMARY KEY", description: "Product ID" },
        { name: "sku", type: "VARCHAR(50) UNIQUE", description: "Stock Keeping Unit" },
        { name: "name", type: "VARCHAR(200)", description: "Product name" },
        { name: "description", type: "TEXT", description: "Product description" },
        { name: "category_id", type: "INTEGER", description: "Foreign key to categories" },
        { name: "unit", type: "VARCHAR(20)", description: "Unit of measurement" },
        { name: "purchase_price", type: "DECIMAL(10,2)", description: "Purchase price" },
        { name: "selling_price", type: "DECIMAL(10,2)", description: "Selling price" },
        { name: "reorder_level", type: "INTEGER", description: "Minimum stock level" },
        { name: "barcode", type: "VARCHAR(50)", description: "Barcode" },
        { name: "hsn_code", type: "VARCHAR(10)", description: "HSN code for GST" },
        { name: "tax_rate", type: "DECIMAL(5,2)", description: "Tax rate percentage" },
        { name: "is_active", type: "BOOLEAN DEFAULT 1", description: "Active status" },
        { name: "created_at", type: "DATETIME DEFAULT CURRENT_TIMESTAMP", description: "Creation timestamp" },
      ],
    },
    {
      name: "inventory",
      description: "Current stock levels",
      columns: [
        { name: "id", type: "INTEGER PRIMARY KEY", description: "Inventory ID" },
        { name: "product_id", type: "INTEGER", description: "Foreign key to products" },
        { name: "current_stock", type: "DECIMAL(10,2)", description: "Current stock quantity" },
        { name: "reserved_stock", type: "DECIMAL(10,2) DEFAULT 0", description: "Reserved stock" },
        { name: "location", type: "VARCHAR(50)", description: "Storage location" },
        { name: "last_updated", type: "DATETIME DEFAULT CURRENT_TIMESTAMP", description: "Last update timestamp" },
      ],
    },
    {
      name: "customers",
      description: "Customer information",
      columns: [
        { name: "id", type: "INTEGER PRIMARY KEY", description: "Customer ID" },
        { name: "name", type: "VARCHAR(100)", description: "Customer name" },
        { name: "contact_person", type: "VARCHAR(100)", description: "Contact person" },
        { name: "phone", type: "VARCHAR(20)", description: "Phone number" },
        { name: "email", type: "VARCHAR(100)", description: "Email address" },
        { name: "address", type: "TEXT", description: "Address" },
        { name: "gst_number", type: "VARCHAR(15)", description: "GST registration number" },
        { name: "credit_limit", type: "DECIMAL(10,2) DEFAULT 0", description: "Credit limit" },
        { name: "payment_terms", type: "INTEGER DEFAULT 0", description: "Payment terms in days" },
        { name: "is_active", type: "BOOLEAN DEFAULT 1", description: "Active status" },
      ],
    },
    {
      name: "purchase_orders",
      description: "Purchase order headers",
      columns: [
        { name: "id", type: "INTEGER PRIMARY KEY", description: "PO ID" },
        { name: "po_number", type: "VARCHAR(50) UNIQUE", description: "PO number" },
        { name: "supplier_id", type: "INTEGER", description: "Foreign key to suppliers" },
        { name: "po_date", type: "DATE", description: "PO date" },
        { name: "expected_delivery", type: "DATE", description: "Expected delivery date" },
        { name: "total_amount", type: "DECIMAL(12,2)", description: "Total PO amount" },
        { name: "status", type: "VARCHAR(20) DEFAULT 'Pending'", description: "PO status" },
        { name: "created_by", type: "INTEGER", description: "Created by user ID" },
        { name: "created_at", type: "DATETIME DEFAULT CURRENT_TIMESTAMP", description: "Creation timestamp" },
      ],
    },
    {
      name: "purchase_order_items",
      description: "Purchase order line items",
      columns: [
        { name: "id", type: "INTEGER PRIMARY KEY", description: "Item ID" },
        { name: "po_id", type: "INTEGER", description: "Foreign key to purchase_orders" },
        { name: "product_id", type: "INTEGER", description: "Foreign key to products" },
        { name: "quantity", type: "DECIMAL(10,2)", description: "Ordered quantity" },
        { name: "unit_price", type: "DECIMAL(10,2)", description: "Unit price" },
        { name: "total_price", type: "DECIMAL(12,2)", description: "Total line amount" },
        { name: "received_quantity", type: "DECIMAL(10,2) DEFAULT 0", description: "Received quantity" },
      ],
    },
    {
      name: "sales_invoices",
      description: "Sales invoice headers",
      columns: [
        { name: "id", type: "INTEGER PRIMARY KEY", description: "Invoice ID" },
        { name: "invoice_number", type: "VARCHAR(50) UNIQUE", description: "Invoice number" },
        { name: "customer_id", type: "INTEGER", description: "Foreign key to customers" },
        { name: "invoice_date", type: "DATE", description: "Invoice date" },
        { name: "due_date", type: "DATE", description: "Payment due date" },
        { name: "subtotal", type: "DECIMAL(12,2)", description: "Subtotal amount" },
        { name: "tax_amount", type: "DECIMAL(10,2)", description: "Tax amount" },
        { name: "total_amount", type: "DECIMAL(12,2)", description: "Total invoice amount" },
        { name: "paid_amount", type: "DECIMAL(12,2) DEFAULT 0", description: "Paid amount" },
        { name: "status", type: "VARCHAR(20) DEFAULT 'Pending'", description: "Payment status" },
        { name: "created_by", type: "INTEGER", description: "Created by user ID" },
        { name: "created_at", type: "DATETIME DEFAULT CURRENT_TIMESTAMP", description: "Creation timestamp" },
      ],
    },
    {
      name: "sales_invoice_items",
      description: "Sales invoice line items",
      columns: [
        { name: "id", type: "INTEGER PRIMARY KEY", description: "Item ID" },
        { name: "invoice_id", type: "INTEGER", description: "Foreign key to sales_invoices" },
        { name: "product_id", type: "INTEGER", description: "Foreign key to products" },
        { name: "quantity", type: "DECIMAL(10,2)", description: "Sold quantity" },
        { name: "unit_price", type: "DECIMAL(10,2)", description: "Unit price" },
        { name: "discount_percent", type: "DECIMAL(5,2) DEFAULT 0", description: "Discount percentage" },
        { name: "tax_rate", type: "DECIMAL(5,2)", description: "Tax rate" },
        { name: "total_price", type: "DECIMAL(12,2)", description: "Total line amount" },
      ],
    },
    {
      name: "stock_movements",
      description: "Stock movement history",
      columns: [
        { name: "id", type: "INTEGER PRIMARY KEY", description: "Movement ID" },
        { name: "product_id", type: "INTEGER", description: "Foreign key to products" },
        { name: "movement_type", type: "VARCHAR(20)", description: "IN/OUT/ADJUSTMENT" },
        { name: "quantity", type: "DECIMAL(10,2)", description: "Movement quantity" },
        { name: "reference_type", type: "VARCHAR(20)", description: "PO/INVOICE/ADJUSTMENT" },
        { name: "reference_id", type: "INTEGER", description: "Reference document ID" },
        { name: "notes", type: "TEXT", description: "Movement notes" },
        { name: "created_by", type: "INTEGER", description: "Created by user ID" },
        { name: "created_at", type: "DATETIME DEFAULT CURRENT_TIMESTAMP", description: "Movement timestamp" },
      ],
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Schema</h1>
        <p className="text-gray-600">SQLite database structure for Sales & Inventory Management System</p>
      </div>

      <div className="grid gap-6">
        {tables.map((table) => (
          <Card key={table.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-blue-600">{table.name}</CardTitle>
                <Badge variant="outline">{table.columns.length} columns</Badge>
              </div>
              <CardDescription>{table.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Column</th>
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-left py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((column, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 font-mono text-blue-600">{column.name}</td>
                        <td className="py-2 font-mono text-gray-600">{column.type}</td>
                        <td className="py-2 text-gray-700">{column.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2 list-disc list-inside">
            <li>All tables include proper foreign key constraints for data integrity</li>
            <li>Indexes should be created on frequently queried columns (SKU, invoice numbers, etc.)</li>
            <li>Timestamps use CURRENT_TIMESTAMP for automatic date/time tracking</li>
            <li>Decimal types used for monetary values to ensure precision</li>
            <li>Boolean fields for active/inactive status enable soft deletes</li>
            <li>Stock movements table provides complete audit trail for inventory changes</li>
            <li>GST/tax fields included for Indian compliance requirements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
