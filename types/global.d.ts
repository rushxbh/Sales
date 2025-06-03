export interface User {
  id: number
  username: string
  full_name: string
  email: string
  role: "Admin" | "Sales" | "Inventory" | "Viewer"
  is_active: boolean
  last_login?: string
  created_at: string
}

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

export interface Supplier {
  id: number
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  gst_number?: string
  payment_terms: number
  is_active: boolean
  created_at: string
}

export interface ElectronAPI {
  auth: {
    login: (username: string, password: string) => Promise<any>
    createUser: (userData: any) => Promise<any>
    getUsers: () => Promise<User[]>
  }
  products: {
    getAll: (filters?: any) => Promise<Product[]>
    create: (productData: any) => Promise<any>
    update: (id: number, productData: any) => Promise<any>
    delete: (id: number) => Promise<any>
    getLowStock: () => Promise<Product[]>
  }
  inventory: {
    updateStock: (
      productId: number,
      quantity: number,
      movementType: string,
      referenceType?: string,
      referenceId?: number,
      notes?: string,
      userId?: number,
    ) => Promise<any>
    getMovements: (productId?: number, limit?: number) => Promise<StockMovement[]>
  }
  categories: {
    getAll: () => Promise<Category[]>
    create: (categoryData: any) => Promise<any>
    update: (id: number, categoryData: any) => Promise<any>
    delete: (id: number) => Promise<any>
  }
  customers: {
    getAll: () => Promise<Customer[]>
    create: (customerData: any) => Promise<any>
    update: (id: number, customerData: any) => Promise<any>
    delete: (id: number) => Promise<any>
  }
  suppliers: {
    getAll: () => Promise<Supplier[]>
    create: (supplierData: any) => Promise<any>
    update: (id: number, supplierData: any) => Promise<any>
    delete: (id: number) => Promise<any>
  }
  invoices: {
    getAll: (filters?: any) => Promise<Invoice[]>
    create: (invoiceData: any) => Promise<any>
    update: (id: number, invoiceData: any) => Promise<any>
    delete: (id: number) => Promise<any>
    getDetails: (invoiceId: number) => Promise<{ invoice?: Invoice; items: InvoiceItem[] }>
    generatePDF: (invoiceId: number, outputPath: string) => Promise<string>
  }
  payments: {
    record: (paymentData: any) => Promise<any>
    getAll: (invoiceId?: number) => Promise<any[]>
  }
  reports: {
    sales: (fromDate: string, toDate: string) => Promise<any>
    inventory: () => Promise<any>
    profit: (fromDate: string, toDate: string) => Promise<any>
  }
  backup: {
    create: () => Promise<any>
    restore: (filename: string) => Promise<any>
    list: () => Promise<any[]>
  }
  settings: {
    get: (key?: string) => Promise<any>
    set: (key: string, value: any) => Promise<any>
    getAll: () => Promise<any>
  }
  notifications: {
    send: (type: "email" | "sms", recipient: string, message: string, subject?: string) => Promise<any>
    getTemplates: () => Promise<any[]>
    updateTemplate: (id: string, template: any) => Promise<any>
  }
  onMenuAction: (callback: (action: string) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
