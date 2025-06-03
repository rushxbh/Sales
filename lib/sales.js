"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCustomers = getAllCustomers;
exports.createCustomer = createCustomer;
exports.getAllInvoices = getAllInvoices;
exports.createInvoice = createInvoice;
exports.getInvoiceDetails = getInvoiceDetails;
exports.recordPayment = recordPayment;
exports.getSalesReport = getSalesReport;
var database_1 = require("./database");
var inventory_1 = require("./inventory");
function getAllCustomers() {
    try {
        var db = (0, database_1.getDatabase)();
        return db
            .prepare("\n      SELECT * FROM customers \n      WHERE is_active = 1 \n      ORDER BY name\n    ")
            .all();
    }
    catch (error) {
        console.error("Get customers error:", error);
        return [];
    }
}
function createCustomer(customerData) {
    try {
        var db = (0, database_1.getDatabase)();
        var result = db
            .prepare("\n      INSERT INTO customers (\n        name, contact_person, phone, email, address, \n        gst_number, credit_limit, payment_terms\n      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n    ")
            .run(customerData.name, customerData.contact_person, customerData.phone, customerData.email, customerData.address, customerData.gst_number, customerData.credit_limit, customerData.payment_terms);
        var newCustomer = db.prepare("SELECT * FROM customers WHERE id = ?").get(result.lastInsertRowid);
        return {
            success: true,
            message: "Customer created successfully",
            customer: newCustomer,
        };
    }
    catch (error) {
        console.error("Create customer error:", error);
        return { success: false, message: "Failed to create customer" };
    }
}
function getAllInvoices(filters) {
    var _a;
    try {
        var db = (0, database_1.getDatabase)();
        var query = "\n      SELECT \n        i.*,\n        c.name as customer_name\n      FROM sales_invoices i\n      LEFT JOIN customers c ON i.customer_id = c.id\n      WHERE 1=1\n    ";
        var params = [];
        if ((filters === null || filters === void 0 ? void 0 : filters.status) && filters.status !== "all") {
            query += " AND i.status = ?";
            params.push(filters.status);
        }
        if (filters === null || filters === void 0 ? void 0 : filters.customerId) {
            query += " AND i.customer_id = ?";
            params.push(filters.customerId);
        }
        if (filters === null || filters === void 0 ? void 0 : filters.fromDate) {
            query += " AND i.invoice_date >= ?";
            params.push(filters.fromDate);
        }
        if (filters === null || filters === void 0 ? void 0 : filters.toDate) {
            query += " AND i.invoice_date <= ?";
            params.push(filters.toDate);
        }
        query += " ORDER BY i.created_at DESC";
        return (_a = db.prepare(query)).all.apply(_a, params);
    }
    catch (error) {
        console.error("Get invoices error:", error);
        return [];
    }
}
function createInvoice(invoiceData) {
    try {
        var db_1 = (0, database_1.getDatabase)();
        // Generate invoice number
        var lastInvoice = db_1.prepare("SELECT invoice_number FROM sales_invoices ORDER BY id DESC LIMIT 1").get();
        var invoiceNumber_1 = "INV0001";
        if (lastInvoice) {
            var lastNumber = Number.parseInt(lastInvoice.invoice_number.replace("INV", ""));
            invoiceNumber_1 = "INV".concat((lastNumber + 1).toString().padStart(4, "0"));
        }
        // Calculate totals
        var subtotal_1 = 0;
        var taxAmount_1 = 0;
        var processedItems_1 = invoiceData.items.map(function (item) {
            var lineTotal = item.quantity * item.unit_price;
            var discountAmount = (lineTotal * (item.discount_percent || 0)) / 100;
            var discountedAmount = lineTotal - discountAmount;
            var lineTax = (discountedAmount * item.tax_rate) / 100;
            var finalTotal = discountedAmount + lineTax;
            subtotal_1 += discountedAmount;
            taxAmount_1 += lineTax;
            return __assign(__assign({}, item), { total_price: finalTotal });
        });
        var totalAmount_1 = subtotal_1 + taxAmount_1;
        // Start transaction
        var transaction = db_1.transaction(function () {
            // Insert invoice
            var invoiceResult = db_1
                .prepare("\n        INSERT INTO sales_invoices (\n          invoice_number, customer_id, invoice_date, due_date,\n          subtotal, tax_amount, total_amount, created_by\n        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n      ")
                .run(invoiceNumber_1, invoiceData.customer_id, invoiceData.invoice_date, invoiceData.due_date, subtotal_1, taxAmount_1, totalAmount_1, invoiceData.created_by);
            var invoiceId = invoiceResult.lastInsertRowid;
            // Insert invoice items and update stock
            processedItems_1.forEach(function (item) {
                db_1.prepare("\n          INSERT INTO sales_invoice_items (\n            invoice_id, product_id, quantity, unit_price,\n            discount_percent, tax_rate, total_price\n          ) VALUES (?, ?, ?, ?, ?, ?, ?)\n        ").run(invoiceId, item.product_id, item.quantity, item.unit_price, item.discount_percent || 0, item.tax_rate, item.total_price);
                // Update stock (reduce inventory)
                var stockResult = (0, inventory_1.updateStock)(item.product_id, item.quantity, "OUT", "INVOICE", invoiceId, "Sale - Invoice ".concat(invoiceNumber_1), invoiceData.created_by);
                if (!stockResult.success) {
                    throw new Error(stockResult.message);
                }
            });
        });
        transaction();
        // Get the created invoice
        var newInvoice = db_1
            .prepare("\n      SELECT \n        i.*,\n        c.name as customer_name\n      FROM sales_invoices i\n      LEFT JOIN customers c ON i.customer_id = c.id\n      WHERE i.id = ?\n    ")
            .get(invoiceId);
        return {
            success: true,
            message: "Invoice created successfully",
            invoice: newInvoice,
        };
    }
    catch (error) {
        console.error("Create invoice error:", error);
        return { success: false, message: error instanceof Error ? error.message : "Failed to create invoice" };
    }
}
function getInvoiceDetails(invoiceId) {
    try {
        var db = (0, database_1.getDatabase)();
        var invoice = db
            .prepare("\n      SELECT \n        i.*,\n        c.name as customer_name\n      FROM sales_invoices i\n      LEFT JOIN customers c ON i.customer_id = c.id\n      WHERE i.id = ?\n    ")
            .get(invoiceId);
        var items = db
            .prepare("\n      SELECT \n        ii.*,\n        p.name as product_name,\n        p.sku\n      FROM sales_invoice_items ii\n      JOIN products p ON ii.product_id = p.id\n      WHERE ii.invoice_id = ?\n    ")
            .all(invoiceId);
        return { invoice: invoice, items: items };
    }
    catch (error) {
        console.error("Get invoice details error:", error);
        return { items: [] };
    }
}
function recordPayment(paymentData) {
    try {
        var db_2 = (0, database_1.getDatabase)();
        // Start transaction
        var transaction = db_2.transaction(function () {
            // Insert payment
            var result = db_2
                .prepare("\n        INSERT INTO payments (\n          invoice_id, amount, payment_method, payment_date,\n          reference_number, notes, created_by\n        ) VALUES (?, ?, ?, ?, ?, ?, ?)\n      ")
                .run(paymentData.invoice_id, paymentData.amount, paymentData.payment_method, paymentData.payment_date, paymentData.reference_number, paymentData.notes, paymentData.created_by);
            // Update invoice paid amount
            db_2.prepare("\n        UPDATE sales_invoices \n        SET paid_amount = paid_amount + ?,\n            status = CASE \n              WHEN paid_amount + ? >= total_amount THEN 'Paid'\n              ELSE 'Pending'\n            END\n        WHERE id = ?\n      ").run(paymentData.amount, paymentData.amount, paymentData.invoice_id);
            return result.lastInsertRowid;
        });
        var paymentId = transaction();
        var newPayment = db_2.prepare("SELECT * FROM payments WHERE id = ?").get(paymentId);
        return {
            success: true,
            message: "Payment recorded successfully",
            payment: newPayment,
        };
    }
    catch (error) {
        console.error("Record payment error:", error);
        return { success: false, message: "Failed to record payment" };
    }
}
function getSalesReport(fromDate, toDate) {
    try {
        var db = (0, database_1.getDatabase)();
        // Get summary data
        var summary = db
            .prepare("\n      SELECT \n        COUNT(*) as total_invoices,\n        SUM(total_amount) as total_sales,\n        SUM(paid_amount) as paid_amount,\n        SUM(total_amount - paid_amount) as pending_amount\n      FROM sales_invoices\n      WHERE invoice_date BETWEEN ? AND ?\n    ")
            .get(fromDate, toDate);
        // Get top products
        var topProducts = db
            .prepare("\n      SELECT \n        p.name as product_name,\n        SUM(ii.quantity) as quantity,\n        SUM(ii.total_price) as revenue\n      FROM sales_invoice_items ii\n      JOIN products p ON ii.product_id = p.id\n      JOIN sales_invoices i ON ii.invoice_id = i.id\n      WHERE i.invoice_date BETWEEN ? AND ?\n      GROUP BY ii.product_id, p.name\n      ORDER BY revenue DESC\n      LIMIT 10\n    ")
            .all(fromDate, toDate);
        // Get daily sales
        var dailySales = db
            .prepare("\n      SELECT \n        invoice_date as date,\n        SUM(total_amount) as amount\n      FROM sales_invoices\n      WHERE invoice_date BETWEEN ? AND ?\n      GROUP BY invoice_date\n      ORDER BY invoice_date\n    ")
            .all(fromDate, toDate);
        return {
            totalSales: (summary === null || summary === void 0 ? void 0 : summary.total_sales) || 0,
            totalInvoices: (summary === null || summary === void 0 ? void 0 : summary.total_invoices) || 0,
            paidAmount: (summary === null || summary === void 0 ? void 0 : summary.paid_amount) || 0,
            pendingAmount: (summary === null || summary === void 0 ? void 0 : summary.pending_amount) || 0,
            topProducts: topProducts || [],
            dailySales: dailySales || [],
        };
    }
    catch (error) {
        console.error("Get sales report error:", error);
        return {
            totalSales: 0,
            totalInvoices: 0,
            paidAmount: 0,
            pendingAmount: 0,
            topProducts: [],
            dailySales: [],
        };
    }
}
