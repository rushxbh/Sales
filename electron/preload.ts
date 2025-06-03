import { contextBridge, ipcRenderer } from "electron"

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Authentication
  auth: {
    login: (username: string, password: string) => ipcRenderer.invoke("auth:login", username, password),
    createUser: (userData: any) => ipcRenderer.invoke("auth:create-user", userData),
    getUsers: () => ipcRenderer.invoke("auth:get-users"),
  },

  // Products
  products: {
    getAll: (filters?: any) => ipcRenderer.invoke("products:get-all", filters),
    create: (productData: any) => ipcRenderer.invoke("products:create", productData),
    getLowStock: () => ipcRenderer.invoke("products:low-stock"),
  },

  // Inventory
  inventory: {
    updateStock: (
      productId: number,
      quantity: number,
      movementType: string,
      referenceType?: string,
      referenceId?: number,
      notes?: string,
      userId?: number,
    ) =>
      ipcRenderer.invoke(
        "inventory:update-stock",
        productId,
        quantity,
        movementType,
        referenceType,
        referenceId,
        notes,
        userId,
      ),
    getMovements: (productId?: number, limit?: number) =>
      ipcRenderer.invoke("inventory:get-movements", productId, limit),
  },

  // Categories
  categories: {
    getAll: () => ipcRenderer.invoke("categories:get-all"),
  },

  // Customers
  customers: {
    getAll: () => ipcRenderer.invoke("customers:get-all"),
    create: (customerData: any) => ipcRenderer.invoke("customers:create", customerData),
  },

  // Invoices
  invoices: {
    getAll: (filters?: any) => ipcRenderer.invoke("invoices:get-all", filters),
    create: (invoiceData: any) => ipcRenderer.invoke("invoices:create", invoiceData),
    getDetails: (invoiceId: number) => ipcRenderer.invoke("invoices:get-details", invoiceId),
    generatePDF: (invoiceId: number, outputPath: string) =>
      ipcRenderer.invoke("invoices:generate-pdf", invoiceId, outputPath),
  },

  // Payments
  payments: {
    record: (paymentData: any) => ipcRenderer.invoke("payments:record", paymentData),
  },

  // Reports
  reports: {
    sales: (fromDate: string, toDate: string) => ipcRenderer.invoke("reports:sales", fromDate, toDate),
  },

  // Backup
  backup: {
    create: () => ipcRenderer.invoke("backup:create"),
    restore: (filename: string) => ipcRenderer.invoke("backup:restore", filename),
    list: () => ipcRenderer.invoke("backup:list"),
  },

  // Menu events
  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on("menu-action", (event, action) => callback(action))
  },
})

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      auth: {
        login: (username: string, password: string) => Promise<any>
        createUser: (userData: any) => Promise<any>
        getUsers: () => Promise<any>
      }
      products: {
        getAll: (filters?: any) => Promise<any>
        create: (productData: any) => Promise<any>
        getLowStock: () => Promise<any>
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
        getMovements: (productId?: number, limit?: number) => Promise<any>
      }
      categories: {
        getAll: () => Promise<any>
      }
      customers: {
        getAll: () => Promise<any>
        create: (customerData: any) => Promise<any>
      }
      invoices: {
        getAll: (filters?: any) => Promise<any>
        create: (invoiceData: any) => Promise<any>
        getDetails: (invoiceId: number) => Promise<any>
        generatePDF: (invoiceId: number, outputPath: string) => Promise<any>
      }
      payments: {
        record: (paymentData: any) => Promise<any>
      }
      reports: {
        sales: (fromDate: string, toDate: string) => Promise<any>
      }
      backup: {
        create: () => Promise<any>
        restore: (filename: string) => Promise<any>
        list: () => Promise<any>
      }
      onMenuAction: (callback: (action: string) => void) => void
    }
  }
}
