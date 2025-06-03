import { app, BrowserWindow, ipcMain, Menu, dialog } from "electron"
import path from "path"
import isDev from "electron-is-dev"
import { initDatabase, closeDatabase } from "../lib/database"
import { authenticateUser, createUser, getAllUsers } from "../lib/auth"
import {
  getAllProducts,
  createProduct,
  updateStock,
  getLowStockProducts,
  getAllCategories,
  getStockMovements,
} from "../lib/inventory"
import {
  getAllCustomers,
  createCustomer,
  getAllInvoices,
  createInvoice,
  getInvoiceDetails,
  recordPayment,
  getSalesReport,
} from "../lib/sales"
import { generateInvoicePDF, generateStockReport } from "../lib/pdf-generator"
import { createBackup, restoreBackup, getBackupList, scheduleAutoBackup } from "../lib/backup"

let mainWindow: BrowserWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../assets/icon.png"),
    show: false,
  })

  const startUrl = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`

  mainWindow.loadURL(startUrl)

  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Create application menu
  createMenu()
}

function createMenu() {
  const template: any = [
    {
      label: "File",
      submenu: [
        {
          label: "New Invoice",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow.webContents.send("menu-action", "new-invoice")
          },
        },
        {
          label: "New Product",
          accelerator: "CmdOrCtrl+P",
          click: () => {
            mainWindow.webContents.send("menu-action", "new-product")
          },
        },
        { type: "separator" },
        {
          label: "Backup Database",
          click: async () => {
            const result = await createBackup()
            dialog.showMessageBox(mainWindow, {
              type: result.success ? "info" : "error",
              title: "Backup",
              message: result.message,
            })
          },
        },
        {
          label: "Restore Database",
          click: async () => {
            const backups = getBackupList()
            if (backups.length === 0) {
              dialog.showMessageBox(mainWindow, {
                type: "info",
                title: "Restore",
                message: "No backup files found",
              })
              return
            }

            const { response } = await dialog.showMessageBox(mainWindow, {
              type: "question",
              title: "Restore Database",
              message: "Select a backup to restore:",
              buttons: [...backups.map((b) => b.filename), "Cancel"],
              defaultId: backups.length,
            })

            if (response < backups.length) {
              const result = await restoreBackup(backups[response].filename)
              dialog.showMessageBox(mainWindow, {
                type: result.success ? "info" : "error",
                title: "Restore",
                message: result.message,
              })
            }
          },
        },
        { type: "separator" },
        {
          label: "Exit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: "Reports",
      submenu: [
        {
          label: "Stock Report",
          click: async () => {
            const { filePath } = await dialog.showSaveDialog(mainWindow, {
              defaultPath: `stock-report-${new Date().toISOString().split("T")[0]}.pdf`,
              filters: [{ name: "PDF Files", extensions: ["pdf"] }],
            })

            if (filePath) {
              try {
                await generateStockReport(filePath)
                dialog.showMessageBox(mainWindow, {
                  type: "info",
                  title: "Report Generated",
                  message: `Stock report saved to ${filePath}`,
                })
              } catch (error) {
                dialog.showErrorBox("Error", "Failed to generate report")
              }
            }
          },
        },
        {
          label: "Sales Report",
          click: () => {
            mainWindow.webContents.send("menu-action", "sales-report")
          },
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About",
              message: "Sales & Inventory Management System",
              detail: "Version 1.0.0\nBuilt with Electron and React",
            })
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// App event handlers
app.whenReady().then(() => {
  // Initialize database
  initDatabase()

  // Schedule automatic backups
  scheduleAutoBackup("daily")

  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  closeDatabase()
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// IPC handlers
ipcMain.handle("auth:login", async (event, username: string, password: string) => {
  return await authenticateUser(username, password)
})

ipcMain.handle("auth:create-user", async (event, userData) => {
  return await createUser(userData)
})

ipcMain.handle("auth:get-users", async () => {
  return getAllUsers()
})

ipcMain.handle("products:get-all", async (event, filters) => {
  return getAllProducts(filters)
})

ipcMain.handle("products:create", async (event, productData) => {
  return createProduct(productData)
})

ipcMain.handle("products:low-stock", async () => {
  return getLowStockProducts()
})

ipcMain.handle(
  "inventory:update-stock",
  async (event, productId, quantity, movementType, referenceType, referenceId, notes, userId) => {
    return updateStock(productId, quantity, movementType, referenceType, referenceId, notes, userId)
  },
)

ipcMain.handle("inventory:get-movements", async (event, productId, limit) => {
  return getStockMovements(productId, limit)
})

ipcMain.handle("categories:get-all", async () => {
  return getAllCategories()
})

ipcMain.handle("customers:get-all", async () => {
  return getAllCustomers()
})

ipcMain.handle("customers:create", async (event, customerData) => {
  return createCustomer(customerData)
})

ipcMain.handle("invoices:get-all", async (event, filters) => {
  return getAllInvoices(filters)
})

ipcMain.handle("invoices:create", async (event, invoiceData) => {
  return createInvoice(invoiceData)
})

ipcMain.handle("invoices:get-details", async (event, invoiceId) => {
  return getInvoiceDetails(invoiceId)
})

ipcMain.handle("invoices:generate-pdf", async (event, invoiceId, outputPath) => {
  const { invoice, items } = getInvoiceDetails(invoiceId)
  if (!invoice) throw new Error("Invoice not found")

  const companyInfo = {
    name: "Your Company Name",
    address: "Your Company Address",
    phone: "+91-XXXXXXXXXX",
    email: "info@company.com",
    gst_number: "GSTIN123456789",
  }

  return await generateInvoicePDF(invoice, items, companyInfo, outputPath)
})

ipcMain.handle("payments:record", async (event, paymentData) => {
  return recordPayment(paymentData)
})

ipcMain.handle("reports:sales", async (event, fromDate, toDate) => {
  return getSalesReport(fromDate, toDate)
})

ipcMain.handle("backup:create", async () => {
  return await createBackup()
})

ipcMain.handle("backup:restore", async (event, filename) => {
  return await restoreBackup(filename)
})

ipcMain.handle("backup:list", async () => {
  return getBackupList()
})
