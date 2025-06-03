"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePDF = generateInvoicePDF;
exports.generateStockReport = generateStockReport;
var pdfkit_1 = require("pdfkit");
var fs_1 = require("fs");
var database_1 = require("./database");
function generateInvoicePDF(invoice, items, companyInfo, outputPath) {
    return new Promise(function (resolve, reject) {
        try {
            var doc_1 = new pdfkit_1.default({ margin: 50 });
            var stream = fs_1.default.createWriteStream(outputPath);
            doc_1.pipe(stream);
            // Header
            doc_1.fontSize(20).text(companyInfo.name, 50, 50);
            doc_1
                .fontSize(10)
                .text(companyInfo.address, 50, 80)
                .text("Phone: ".concat(companyInfo.phone), 50, 95)
                .text("Email: ".concat(companyInfo.email), 50, 110)
                .text("GST: ".concat(companyInfo.gst_number), 50, 125);
            // Invoice title
            doc_1.fontSize(24).text("INVOICE", 400, 50);
            // Invoice details
            doc_1
                .fontSize(10)
                .text("Invoice No: ".concat(invoice.invoice_number), 400, 80)
                .text("Date: ".concat(invoice.invoice_date), 400, 95)
                .text("Due Date: ".concat(invoice.due_date || "N/A"), 400, 110);
            // Customer details
            doc_1.text("Bill To:", 50, 160);
            doc_1.fontSize(12).text(invoice.customer_name || "Customer", 50, 180);
            // Table header
            var tableTop = 250;
            doc_1
                .fontSize(10)
                .text("Item", 50, tableTop)
                .text("Qty", 200, tableTop)
                .text("Rate", 250, tableTop)
                .text("Discount", 300, tableTop)
                .text("Tax", 350, tableTop)
                .text("Amount", 450, tableTop);
            // Draw line under header
            doc_1
                .moveTo(50, tableTop + 15)
                .lineTo(550, tableTop + 15)
                .stroke();
            // Table rows
            var yPosition_1 = tableTop + 30;
            items.forEach(function (item, index) {
                doc_1
                    .text(item.product_name || "Product", 50, yPosition_1)
                    .text(item.quantity.toString(), 200, yPosition_1)
                    .text("\u20B9".concat(item.unit_price.toFixed(2)), 250, yPosition_1)
                    .text("".concat(item.discount_percent, "%"), 300, yPosition_1)
                    .text("".concat(item.tax_rate, "%"), 350, yPosition_1)
                    .text("\u20B9".concat(item.total_price.toFixed(2)), 450, yPosition_1);
                yPosition_1 += 20;
            });
            // Totals
            var totalsY = yPosition_1 + 30;
            doc_1
                .moveTo(350, totalsY - 10)
                .lineTo(550, totalsY - 10)
                .stroke();
            doc_1
                .text("Subtotal: \u20B9".concat(invoice.subtotal.toFixed(2)), 350, totalsY)
                .text("Tax: \u20B9".concat(invoice.tax_amount.toFixed(2)), 350, totalsY + 15)
                .text("Total: \u20B9".concat(invoice.total_amount.toFixed(2)), 350, totalsY + 30)
                .text("Paid: \u20B9".concat(invoice.paid_amount.toFixed(2)), 350, totalsY + 45)
                .text("Balance: \u20B9".concat((invoice.total_amount - invoice.paid_amount).toFixed(2)), 350, totalsY + 60);
            // Footer
            doc_1
                .fontSize(8)
                .text("Thank you for your business!", 50, doc_1.page.height - 100)
                .text("This is a computer generated invoice.", 50, doc_1.page.height - 85);
            doc_1.end();
            stream.on("finish", function () {
                resolve(outputPath);
            });
            stream.on("error", function (error) {
                reject(error);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
function generateStockReport(outputPath) {
    return new Promise(function (resolve, reject) {
        try {
            var db = (0, database_1.getDatabase)();
            var products = db
                .prepare("\n        SELECT \n          p.sku,\n          p.name,\n          c.name as category_name,\n          p.unit,\n          COALESCE(i.current_stock, 0) as current_stock,\n          p.reorder_level,\n          p.selling_price,\n          (COALESCE(i.current_stock, 0) * p.selling_price) as stock_value\n        FROM products p\n        LEFT JOIN categories c ON p.category_id = c.id\n        LEFT JOIN inventory i ON p.id = i.product_id\n        WHERE p.is_active = 1\n        ORDER BY p.name\n      ")
                .all();
            var doc_2 = new pdfkit_1.default({ margin: 50 });
            var stream = fs_1.default.createWriteStream(outputPath);
            doc_2.pipe(stream);
            // Header
            doc_2.fontSize(18).text("Stock Report", 50, 50);
            doc_2.fontSize(10).text("Generated on: ".concat(new Date().toLocaleDateString()), 50, 80);
            // Table header
            var tableTop = 120;
            doc_2
                .fontSize(8)
                .text("SKU", 50, tableTop)
                .text("Product Name", 100, tableTop)
                .text("Category", 200, tableTop)
                .text("Stock", 270, tableTop)
                .text("Unit", 310, tableTop)
                .text("Reorder", 350, tableTop)
                .text("Price", 400, tableTop)
                .text("Value", 450, tableTop);
            // Draw line under header
            doc_2
                .moveTo(50, tableTop + 15)
                .lineTo(550, tableTop + 15)
                .stroke();
            // Table rows
            var yPosition_2 = tableTop + 25;
            var totalValue_1 = 0;
            products.forEach(function (product) {
                if (yPosition_2 > 700) {
                    doc_2.addPage();
                    yPosition_2 = 50;
                }
                var stockColor = product.current_stock <= product.reorder_level ? "red" : "black";
                doc_2
                    .fillColor("black")
                    .text(product.sku, 50, yPosition_2)
                    .text(product.name.substring(0, 20), 100, yPosition_2)
                    .text(product.category_name, 200, yPosition_2)
                    .fillColor(stockColor)
                    .text(product.current_stock.toString(), 270, yPosition_2)
                    .fillColor("black")
                    .text(product.unit, 310, yPosition_2)
                    .text(product.reorder_level.toString(), 350, yPosition_2)
                    .text("\u20B9".concat(product.selling_price.toFixed(2)), 400, yPosition_2)
                    .text("\u20B9".concat(product.stock_value.toFixed(2)), 450, yPosition_2);
                totalValue_1 += product.stock_value;
                yPosition_2 += 15;
            });
            // Total
            doc_2
                .moveTo(400, yPosition_2 + 10)
                .lineTo(550, yPosition_2 + 10)
                .stroke();
            doc_2.fontSize(10).text("Total Stock Value: \u20B9".concat(totalValue_1.toFixed(2)), 400, yPosition_2 + 20);
            doc_2.end();
            stream.on("finish", function () {
                resolve(outputPath);
            });
            stream.on("error", function (error) {
                reject(error);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
