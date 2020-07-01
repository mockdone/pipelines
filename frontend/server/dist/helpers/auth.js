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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var portable_fetch_1 = __importDefault(require("portable-fetch"));
var auth_1 = require("../src/generated/apis/auth");
var utils_1 = require("../utils");
exports.getAuthorizeFn = function (authConfigs, otherConfigs) {
    var apiServerAddress = otherConfigs.apiServerAddress;
    // TODO: Use portable-fetch instead of node-fetch in other parts too. The generated api here only
    // supports portable-fetch.
    var authService = new auth_1.AuthServiceApi({ basePath: apiServerAddress }, undefined, portable_fetch_1.default);
    var authorize = function (_a, req) {
        var resources = _a.resources, verb = _a.verb, namespace = _a.namespace;
        return __awaiter(void 0, void 0, void 0, function () {
            var err_1, details, message;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!authConfigs.enabled) {
                            return [2 /*return*/, undefined];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 5]);
                        // Resources and verb are string enums, they are used as string here, that
                        // requires a force type conversion. If we generated client should accept
                        // enums instead.
                        return [4 /*yield*/, authService.authorize(namespace, resources, verb, {
                                // Pass authentication header.
                                headers: (_b = {},
                                    _b[authConfigs.kubeflowUserIdHeader] = req.headers[authConfigs.kubeflowUserIdHeader],
                                    _b),
                            })];
                    case 2:
                        // Resources and verb are string enums, they are used as string here, that
                        // requires a force type conversion. If we generated client should accept
                        // enums instead.
                        _c.sent();
                        console.debug("Authorized to " + verb + " " + resources + " in namespace " + namespace + ".");
                        return [2 /*return*/, undefined];
                    case 3:
                        err_1 = _c.sent();
                        return [4 /*yield*/, utils_1.parseError(err_1)];
                    case 4:
                        details = _c.sent();
                        message = "User is not authorized to " + verb + " " + resources + " in namespace " + namespace + ": " + details.message;
                        console.error(message, details.additionalInfo);
                        return [2 /*return*/, { message: message, additionalInfo: details.additionalInfo }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return authorize;
};
//# sourceMappingURL=auth.js.map