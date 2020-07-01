"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright 2018-2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var fs_1 = require("fs");
var stream_1 = require("stream");
/** get the server address from host, port, and schema (defaults to 'http'). */
function getAddress(_a) {
    var host = _a.host, port = _a.port, namespace = _a.namespace, _b = _a.schema, schema = _b === void 0 ? 'http' : _b;
    namespace = namespace ? "." + namespace : '';
    port = port ? ":" + port : '';
    return schema + "://" + host + namespace + port;
}
exports.getAddress = getAddress;
function equalArrays(a1, a2) {
    if (!Array.isArray(a1) || !Array.isArray(a2) || a1.length !== a2.length) {
        return false;
    }
    return JSON.stringify(a1) === JSON.stringify(a2);
}
exports.equalArrays = equalArrays;
function generateRandomString(length) {
    var d = new Date().getTime();
    function randomChar() {
        var r = Math.trunc((d + Math.random() * 16) % 16);
        d = Math.floor(d / 16);
        return r.toString(16);
    }
    var str = '';
    for (var i = 0; i < length; ++i) {
        str += randomChar();
    }
    return str;
}
exports.generateRandomString = generateRandomString;
function loadJSON(filepath, defaultValue) {
    if (!filepath) {
        return defaultValue;
    }
    try {
        return JSON.parse(fs_1.readFileSync(filepath, 'utf-8'));
    }
    catch (error) {
        console.error("Failed reading json data from '" + filepath + "':");
        console.error(error);
        return defaultValue;
    }
}
exports.loadJSON = loadJSON;
/**
 * Transform stream that only stream the first X number of bytes.
 */
var PreviewStream = /** @class */ (function (_super) {
    __extends(PreviewStream, _super);
    function PreviewStream(_a) {
        var peek = _a.peek, opts = __rest(_a, ["peek"]);
        var _this = this;
        // acts like passthrough
        var transform = function (chunk, _encoding, callback) {
            return callback(undefined, chunk);
        };
        // implements preview - peek must be positive number
        if (peek && peek > 0) {
            var size_1 = 0;
            transform = function (chunk, _encoding, callback) {
                var delta = peek - size_1;
                size_1 += chunk.length;
                if (size_1 >= peek) {
                    callback(undefined, chunk.slice(0, delta));
                    _this.resume(); // do not handle any subsequent data
                    return;
                }
                callback(undefined, chunk);
            };
        }
        _this = _super.call(this, __assign(__assign({}, opts), { transform: transform })) || this;
        return _this;
    }
    return PreviewStream;
}(stream_1.Transform));
exports.PreviewStream = PreviewStream;
var UNKOWN_ERROR = 'Unknown error';
function parseError(error) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = parseK8sError(error);
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, parseKfpApiError(error)];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2: return [2 /*return*/, (_a ||
                        parseGenericError(error) || { message: UNKOWN_ERROR, additionalInfo: error })];
            }
        });
    });
}
exports.parseError = parseError;
function parseGenericError(error) {
    if (!error) {
        return undefined;
    }
    else if (typeof error === 'string') {
        return {
            message: error,
            additionalInfo: error,
        };
    }
    else if (error instanceof Error) {
        return { message: error.message, additionalInfo: error };
    }
    else if (error.message && typeof error.message === 'string') {
        return { message: error.message, additionalInfo: error };
    }
    else if (error.url &&
        typeof error.url === 'string' &&
        error.status &&
        typeof error.status === 'number' &&
        error.statusText &&
        typeof error.statusText === 'string') {
        var url = error.url, status_1 = error.status, statusText = error.statusText;
        return {
            message: "Fetching " + url + " failed with status code " + status_1 + " and message: " + statusText,
            additionalInfo: { url: url, status: status_1, statusText: statusText },
        };
    }
    // Cannot understand error type
    return undefined;
}
function parseKfpApiError(error) {
    return __awaiter(this, void 0, void 0, function () {
        var json, message, details, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!error || !error.json || typeof error.json !== 'function') {
                        return [2 /*return*/, undefined];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, error.json()];
                case 2:
                    json = _a.sent();
                    message = json.error, details = json.details;
                    if (message && details && typeof message === 'string' && typeof details === 'object') {
                        return [2 /*return*/, {
                                message: message,
                                additionalInfo: details,
                            }];
                    }
                    else {
                        return [2 /*return*/, undefined];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    return [2 /*return*/, undefined];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function parseK8sError(error) {
    if (!error || !error.body || typeof error.body !== 'object') {
        return undefined;
    }
    if (typeof error.body.message !== 'string') {
        return undefined;
    }
    // Kubernetes client http error has body with all the info.
    // Example error.body
    // {
    //   kind: 'Status',
    //   apiVersion: 'v1',
    //   metadata: {},
    //   status: 'Failure',
    //   message: 'pods "test-pod" not found',
    //   reason: 'NotFound',
    //   details: { name: 'test-pod', kind: 'pods' },
    //   code: 404
    // }
    return {
        message: error.body.message,
        additionalInfo: error.body,
    };
}
//# sourceMappingURL=utils.js.map