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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBackup = createBackup;
exports.restoreBackup = restoreBackup;
exports.getBackupList = getBackupList;
exports.deleteBackup = deleteBackup;
exports.scheduleAutoBackup = scheduleAutoBackup;
var fs_1 = require("fs");
var path_1 = require("path");
var electron_1 = require("electron");
var database_1 = require("./database");
function createBackup() {
    return new Promise(function (resolve) {
        try {
            var db = (0, database_1.getDatabase)();
            var timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            var backupFilename = "backup_".concat(timestamp, ".db");
            var backupPath = path_1.default.join(electron_1.app.getPath("userData"), "backups", backupFilename);
            // Ensure backup directory exists
            var backupDir = path_1.default.dirname(backupPath);
            if (!fs_1.default.existsSync(backupDir)) {
                fs_1.default.mkdirSync(backupDir, { recursive: true });
            }
            // Create backup using SQLite backup API
            var backup = db.backup(backupPath);
            backup.step(-1); // Copy entire database
            backup.finish();
            resolve({
                success: true,
                message: "Backup created successfully",
                filename: backupFilename,
            });
        }
        catch (error) {
            console.error("Backup error:", error);
            resolve({
                success: false,
                message: error instanceof Error ? error.message : "Backup failed",
            });
        }
    });
}
function restoreBackup(backupFilename) {
    return new Promise(function (resolve) {
        try {
            var backupPath = path_1.default.join(electron_1.app.getPath("userData"), "backups", backupFilename);
            if (!fs_1.default.existsSync(backupPath)) {
                resolve({
                    success: false,
                    message: "Backup file not found",
                });
                return;
            }
            // Close current database
            var db = (0, database_1.getDatabase)();
            db.close();
            // Replace current database with backup
            var currentDbPath = path_1.default.join(electron_1.app.getPath("userData"), "inventory.db");
            fs_1.default.copyFileSync(backupPath, currentDbPath);
            // Reinitialize database
            var initDatabase = require("./database").initDatabase;
            initDatabase();
            resolve({
                success: true,
                message: "Database restored successfully",
            });
        }
        catch (error) {
            console.error("Restore error:", error);
            resolve({
                success: false,
                message: error instanceof Error ? error.message : "Restore failed",
            });
        }
    });
}
function getBackupList() {
    try {
        var backupDir_1 = path_1.default.join(electron_1.app.getPath("userData"), "backups");
        if (!fs_1.default.existsSync(backupDir_1)) {
            return [];
        }
        var files = fs_1.default
            .readdirSync(backupDir_1)
            .filter(function (file) { return file.endsWith(".db"); })
            .map(function (file) {
            var filePath = path_1.default.join(backupDir_1, file);
            var stats = fs_1.default.statSync(filePath);
            return {
                filename: file,
                size: stats.size,
                created_at: stats.birthtime.toISOString(),
            };
        })
            .sort(function (a, b) { return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); });
        return files;
    }
    catch (error) {
        console.error("Get backup list error:", error);
        return [];
    }
}
function deleteBackup(backupFilename) {
    try {
        var backupPath = path_1.default.join(electron_1.app.getPath("userData"), "backups", backupFilename);
        if (!fs_1.default.existsSync(backupPath)) {
            return {
                success: false,
                message: "Backup file not found",
            };
        }
        fs_1.default.unlinkSync(backupPath);
        return {
            success: true,
            message: "Backup deleted successfully",
        };
    }
    catch (error) {
        console.error("Delete backup error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to delete backup",
        };
    }
}
function scheduleAutoBackup(frequency) {
    var _this = this;
    var intervals = {
        daily: 24 * 60 * 60 * 1000, // 24 hours
        weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
        monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    var interval = intervals[frequency];
    setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
        var result, backups, oldBackups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Creating automatic backup...");
                    return [4 /*yield*/, createBackup()];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        console.log("Automatic backup created:", result.filename);
                        backups = getBackupList();
                        if (backups.length > 10) {
                            oldBackups = backups.slice(10);
                            oldBackups.forEach(function (backup) {
                                deleteBackup(backup.filename);
                            });
                        }
                    }
                    else {
                        console.error("Automatic backup failed:", result.message);
                    }
                    return [2 /*return*/];
            }
        });
    }); }, interval);
}
