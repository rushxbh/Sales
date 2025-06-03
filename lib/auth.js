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
exports.authenticateUser = authenticateUser;
exports.verifyToken = verifyToken;
exports.createUser = createUser;
exports.getAllUsers = getAllUsers;
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var database_1 = require("./database");
var JWT_SECRET = "your-secret-key-change-in-production";
function authenticateUser(username, password) {
    return __awaiter(this, void 0, void 0, function () {
        var db, user, isValidPassword, token, userInfo, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    db = (0, database_1.getDatabase)();
                    user = db
                        .prepare("\n      SELECT id, username, password_hash, full_name, role, email, is_active\n      FROM users \n      WHERE username = ? AND is_active = 1\n    ")
                        .get(username);
                    if (!user) {
                        return [2 /*return*/, { success: false, message: "Invalid username or password" }];
                    }
                    return [4 /*yield*/, bcrypt_1.default.compare(password, user.password_hash)];
                case 1:
                    isValidPassword = _a.sent();
                    if (!isValidPassword) {
                        return [2 /*return*/, { success: false, message: "Invalid username or password" }];
                    }
                    // Update last login
                    db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);
                    token = jsonwebtoken_1.default.sign({
                        userId: user.id,
                        username: user.username,
                        role: user.role,
                    }, JWT_SECRET, { expiresIn: "24h" });
                    userInfo = {
                        id: user.id,
                        username: user.username,
                        full_name: user.full_name,
                        role: user.role,
                        email: user.email,
                        is_active: user.is_active,
                    };
                    return [2 /*return*/, {
                            success: true,
                            user: userInfo,
                            token: token,
                            message: "Login successful",
                        }];
                case 2:
                    error_1 = _a.sent();
                    console.error("Authentication error:", error_1);
                    return [2 /*return*/, { success: false, message: "Authentication failed" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
function createUser(userData) {
    return __awaiter(this, void 0, void 0, function () {
        var db, existingUser, hashedPassword, result, newUser, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    db = (0, database_1.getDatabase)();
                    existingUser = db.prepare("SELECT id FROM users WHERE username = ?").get(userData.username);
                    if (existingUser) {
                        return [2 /*return*/, { success: false, message: "Username already exists" }];
                    }
                    return [4 /*yield*/, bcrypt_1.default.hash(userData.password, 10)
                        // Insert new user
                    ];
                case 1:
                    hashedPassword = _a.sent();
                    result = db
                        .prepare("\n      INSERT INTO users (username, password_hash, full_name, role, email)\n      VALUES (?, ?, ?, ?, ?)\n    ")
                        .run(userData.username, hashedPassword, userData.full_name, userData.role, userData.email);
                    newUser = {
                        id: result.lastInsertRowid,
                        username: userData.username,
                        full_name: userData.full_name,
                        role: userData.role,
                        email: userData.email,
                        is_active: true,
                    };
                    return [2 /*return*/, {
                            success: true,
                            message: "User created successfully",
                            user: newUser,
                        }];
                case 2:
                    error_2 = _a.sent();
                    console.error("User creation error:", error_2);
                    return [2 /*return*/, { success: false, message: "Failed to create user" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getAllUsers() {
    try {
        var db = (0, database_1.getDatabase)();
        var users = db
            .prepare("\n      SELECT id, username, full_name, role, email, is_active\n      FROM users\n      ORDER BY full_name\n    ")
            .all();
        return users;
    }
    catch (error) {
        console.error("Get users error:", error);
        return [];
    }
}
