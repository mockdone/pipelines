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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var k8sHelper = __importStar(require("../k8s-helper"));
var auth_1 = require("../src/generated/apis/auth");
var utils_1 = require("../utils");
exports.getTensorboardHandlers = function (tensorboardConfig, authorizeFn) {
    /**
     * A handler which retrieve the endpoint for a tensorboard instance. The
     * handler expects a query string `logdir`.
     */
    var get = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, logdir, namespace, authError, _b, _c, err_1, details;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = req.query, logdir = _a.logdir, namespace = _a.namespace;
                    if (!logdir) {
                        res.status(400).send('logdir argument is required');
                        return [2 /*return*/];
                    }
                    if (!namespace) {
                        res.status(400).send('namespace argument is required');
                        return [2 /*return*/];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 6]);
                    return [4 /*yield*/, authorizeFn({
                            verb: auth_1.AuthorizeRequestVerb.GET,
                            resources: auth_1.AuthorizeRequestResources.VIEWERS,
                            namespace: namespace,
                        }, req)];
                case 2:
                    authError = _d.sent();
                    if (authError) {
                        res.status(401).send(authError.message);
                        return [2 /*return*/];
                    }
                    _c = (_b = res).send;
                    return [4 /*yield*/, k8sHelper.getTensorboardInstance(logdir, namespace)];
                case 3:
                    _c.apply(_b, [_d.sent()]);
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _d.sent();
                    return [4 /*yield*/, utils_1.parseError(err_1)];
                case 5:
                    details = _d.sent();
                    console.error("Failed to list Tensorboard pods: " + details.message, details.additionalInfo);
                    res.status(500).send("Failed to list Tensorboard pods: " + details.message);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    /**
     * A handler which will create a tensorboard viewer CRD, waits for the
     * tensorboard instance to be ready, and return the endpoint to the instance.
     * The handler expects the following query strings in the request:
     * - `logdir`
     * - `tfversion`
     */
    var create = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, logdir, namespace, tfversion, authError, tensorboardAddress, err_2, details;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.query, logdir = _a.logdir, namespace = _a.namespace, tfversion = _a.tfversion;
                    if (!logdir) {
                        res.status(400).send('logdir argument is required');
                        return [2 /*return*/];
                    }
                    if (!namespace) {
                        res.status(400).send('namespace argument is required');
                        return [2 /*return*/];
                    }
                    if (!tfversion) {
                        res.status(400).send('tfversion (tensorflow version) argument is required');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 7]);
                    return [4 /*yield*/, authorizeFn({
                            verb: auth_1.AuthorizeRequestVerb.CREATE,
                            resources: auth_1.AuthorizeRequestResources.VIEWERS,
                            namespace: namespace,
                        }, req)];
                case 2:
                    authError = _b.sent();
                    if (authError) {
                        res.status(401).send(authError.message);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, k8sHelper.newTensorboardInstance(logdir, namespace, tensorboardConfig.tfImageName, tfversion, tensorboardConfig.podTemplateSpec)];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, k8sHelper.waitForTensorboardInstance(logdir, namespace, 60 * 1000)];
                case 4:
                    tensorboardAddress = _b.sent();
                    res.send(tensorboardAddress);
                    return [3 /*break*/, 7];
                case 5:
                    err_2 = _b.sent();
                    return [4 /*yield*/, utils_1.parseError(err_2)];
                case 6:
                    details = _b.sent();
                    console.error("Failed to start Tensorboard app: " + details.message, details.additionalInfo);
                    res.status(500).send("Failed to start Tensorboard app: " + details.message);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    /**
     * A handler that deletes a tensorboard viewer. The handler expects query string
     * `logdir` in the request.
     */
    var deleteHandler = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, logdir, namespace, authError, err_3, details;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.query, logdir = _a.logdir, namespace = _a.namespace;
                    if (!logdir) {
                        res.status(400).send('logdir argument is required');
                        return [2 /*return*/];
                    }
                    if (!namespace) {
                        res.status(400).send('namespace argument is required');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 6]);
                    return [4 /*yield*/, authorizeFn({
                            verb: auth_1.AuthorizeRequestVerb.DELETE,
                            resources: auth_1.AuthorizeRequestResources.VIEWERS,
                            namespace: namespace,
                        }, req)];
                case 2:
                    authError = _b.sent();
                    if (authError) {
                        res.status(401).send(authError.message);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, k8sHelper.deleteTensorboardInstance(logdir, namespace)];
                case 3:
                    _b.sent();
                    res.send('Tensorboard deleted.');
                    return [3 /*break*/, 6];
                case 4:
                    err_3 = _b.sent();
                    return [4 /*yield*/, utils_1.parseError(err_3)];
                case 5:
                    details = _b.sent();
                    console.error("Failed to delete Tensorboard app: " + details.message, details.additionalInfo);
                    res.status(500).send("Failed to delete Tensorboard app: " + details.message);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return {
        get: get,
        create: create,
        delete: deleteHandler,
    };
};
//# sourceMappingURL=tensorboard.js.map