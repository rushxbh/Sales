"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path_1 = require("path");
var electron_is_dev_1 = require("electron-is-dev");
var database_1 = require("../lib/database");
var auth_1 = require("../lib/auth");
var inventory_1 = require("../lib/inventory");
var sales_1 = require("../lib/sales");
var pdf_generator_1 = require("../lib/pdf-generator");
var backup_1 = require("../lib/backup");
var mainWindow;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, "preload.js"),
        },
        icon: path_1.default.join(__dirname, "../assets/icon.png"),
        show: false,
    });
    var startUrl = electron_is_dev_1.default ? "http://localhost:3000" : "file://".concat(path_1.default.join(__dirname, "../build/index.html"));
    mainWindow.loadURL(startUrl);
    mainWindow.once("ready-to-show", function () {
        mainWindow.show();
    });
    if (electron_is_dev_1.default) {
        mainWindow.webContents.openDevTools();
    }
    // Create application menu
    createMenu();
}
function createMenu() {
    var _this = this;
    var template = [
        {
            label: "File",
            submenu: [
                {
                    label: "New Invoice",
                    accelerator: "CmdOrCtrl+N",
                    click: function () {
                        mainWindow.webContents.send("menu-action", "new-invoice");
                    },
                },
                {
                    label: "New Product",
                    accelerator: "CmdOrCtrl+P",
                    click: function () {
                        mainWindow.webContents.send("menu-action", "new-product");
                    },
                },
                { type: "separator" },
                {
                    label: "Backup Database",
                    click: function () { return __awaiter(_this, void 0, void 0, function () {
                        var result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, backup_1.createBackup)()];
                                case 1:
                                    result = _a.sent();
                                    electron_1.dialog.showMessageBox(mainWindow, {
                                        type: result.success ? "info" : "error",
                                        title: "Backup",
                                        message: result.message,
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); },
                },
                {
                    label: "Restore Database",
                    click: function () { return __awaiter(_this, void 0, void 0, function () {
                        var backups, response, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    backups = (0, backup_1.getBackupList)();
                                    if (backups.length === 0) {
                                        electron_1.dialog.showMessageBox(mainWindow, {
                                            type: "info",
                                            title: "Restore",
                                            message: "No backup files found",
                                        });
                                        return [2 /*return*/];
                                    }
                                    return [4 /*yield*/, electron_1.dialog.showMessageBox(mainWindow, {
                                            type: "question",
                                            title: "Restore Database",
                                            message: "Select a backup to restore:",
                                            buttons: __spreadArray(__spreadArray([], backups.map(function (b) { return b.filename; }), true), ["Cancel"], false),
                                            defaultId: backups.length,
                                        })];
                                case 1:
                                    response = (_a.sent()).response;
                                    if (!(response < backups.length)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, (0, backup_1.restoreBackup)(backups[response].filename)];
                                case 2:
                                    result = _a.sent();
                                    electron_1.dialog.showMessageBox(mainWindow, {
                                        type: result.success ? "info" : "error",
                                        title: "Restore",
                                        message: result.message,
                                    });
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); },
                },
                { type: "separator" },
                {
                    label: "Exit",
                    accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
                    click: function () {
                        electron_1.app.quit();
                    },
                },
            ],
        },
        {
            label: "Reports",
            submenu: [
                {
                    label: "Stock Report",
                    click: function () { return __awaiter(_this, void 0, void 0, function () {
                        var filePath, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, electron_1.dialog.showSaveDialog(mainWindow, {
                                        defaultPath: "stock-report-".concat(new Date().toISOString().split("T")[0], ".pdf"),
                                        filters: [{ name: "PDF Files", extensions: ["pdf"] }],
                                    })];
                                case 1:
                                    filePath = (_a.sent()).filePath;
                                    if (!filePath) return [3 /*break*/, 5];
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, (0, pdf_generator_1.generateStockReport)(filePath)];
                                case 3:
                                    _a.sent();
                                    electron_1.dialog.showMessageBox(mainWindow, {
                                        type: "info",
                                        title: "Report Generated",
                                        message: "Stock report saved to ".concat(filePath),
                                    });
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_1 = _a.sent();
                                    electron_1.dialog.showErrorBox("Error", "Failed to generate report");
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); },
                },
                {
                    label: "Sales Report",
                    click: function () {
                        mainWindow.webContents.send("menu-action", "sales-report");
                    },
                },
            ],
        },
        {
            label: "Help",
            submenu: [
                {
                    label: "About",
                    click: function () {
                        electron_1.dialog.showMessageBox(mainWindow, {
                            type: "info",
                            title: "About",
                            message: "Sales & Inventory Management System",
                            detail: "Version 1.0.0\nBuilt with Electron and React",
                        });
                    },
                },
            ],
        },
    ];
    var menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
// App event handlers
electron_1.app.whenReady().then(function () {
    // Initialize database
    (0, database_1.initDatabase)();
    // Schedule automatic backups
    (0, backup_1.scheduleAutoBackup)("daily");
    createWindow();
    electron_1.app.on("activate", function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", function () {
    (0, database_1.closeDatabase)();
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
// IPC handlers
electron_1.ipcMain.handle("auth:login", function (event, username, password) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, auth_1.authenticateUser)(username, password)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); });
electron_1.ipcMain.handle("auth:create-user", function (event, userData) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, auth_1.createUser)(userData)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); });
electron_1.ipcMain.handle("auth:get-users", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, auth_1.getAllUsers)()];
    });
}); });
electron_1.ipcMain.handle("products:get-all", function (event, filters) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, inventory_1.getAllProducts)(filters)];
    });
}); });
electron_1.ipcMain.handle("products:create", function (event, productData) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, inventory_1.createProduct)(productData)];
    });
}); });
electron_1.ipcMain.handle("products:low-stock", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, inventory_1.getLowStockProducts)()];
    });
}); });
electron_1.ipcMain.handle("inventory:update-stock", function (event, productId, quantity, movementType, referenceType, referenceId, notes, userId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, inventory_1.updateStock)(productId, quantity, movementType, referenceType, referenceId, notes, userId)];
    });
}); });
electron_1.ipcMain.handle("inventory:get-movements", function (event, productId, limit) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, inventory_1.getStockMovements)(productId, limit)];
    });
}); });
electron_1.ipcMain.handle("categories:get-all", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, inventory_1.getAllCategories)()];
    });
}); });
electron_1.ipcMain.handle("customers:get-all", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, sales_1.getAllCustomers)()];
    });
}); });
electron_1.ipcMain.handle("customers:create", function (event, customerData) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, sales_1.createCustomer)(customerData)];
    });
}); });
electron_1.ipcMain.handle("invoices:get-all", function (event, filters) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, sales_1.getAllInvoices)(filters)];
    });
}); });
electron_1.ipcMain.handle("invoices:create", function (event, invoiceData) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, sales_1.createInvoice)(invoiceData)];
    });
}); });
electron_1.ipcMain.handle("invoices:get-details", function (event, invoiceId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, sales_1.getInvoiceDetails)(invoiceId)];
    });
}); });
electron_1.ipcMain.handle("invoices:generate-pdf", function (event, invoiceId, outputPath) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, invoice, items, companyInfo;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = (0, sales_1.getInvoiceDetails)(invoiceId), invoice = _a.invoice, items = _a.items;
                if (!invoice)
                    throw new Error("Invoice not found");
                companyInfo = {
                    name: "Your Company Name",
                    address: "Your Company Address",
                    phone: "+91-XXXXXXXXXX",
                    email: "info@company.com",
                    gst_number: "GSTIN123456789",
                };
                return [4 /*yield*/, (0, pdf_generator_1.generateInvoicePDF)(invoice, items, companyInfo, outputPath)];
            case 1: return [2 /*return*/, _b.sent()];
        }
    });
}); });
electron_1.ipcMain.handle("payments:record", function (event, paymentData) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, sales_1.recordPayment)(paymentData)];
    });
}); });
electron_1.ipcMain.handle("reports:sales", function (event, fromDate, toDate) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, sales_1.getSalesReport)(fromDate, toDate)];
    });
}); });
electron_1.ipcMain.handle("backup:create", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, backup_1.createBackup)()];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); });
electron_1.ipcMain.handle("backup:restore", function (event, filename) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, backup_1.restoreBackup)(filename)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); });
electron_1.ipcMain.handle("backup:list", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, backup_1.getBackupList)()];
    });
}); });
