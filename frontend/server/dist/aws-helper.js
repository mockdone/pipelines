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
// Copyright 2019 Google LLC
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
var node_fetch_1 = __importDefault(require("node-fetch"));
/** url for aws metadata store. */
var metadataUrl = 'http://169.254.169.254/latest/meta-data';
/**
 * Get the AWS IAM instance profile.
 */
function getIAMInstanceProfile() {
    return __awaiter(this, void 0, void 0, function () {
        var resp, profiles, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, node_fetch_1.default(metadataUrl + "/iam/security-credentials/")];
                case 1:
                    resp = _a.sent();
                    return [4 /*yield*/, resp.text()];
                case 2:
                    profiles = (_a.sent()).split('\n');
                    if (profiles.length > 0) {
                        return [2 /*return*/, profiles[0].trim()]; // return first profile
                    }
                    return [2 /*return*/];
                case 3:
                    error_1 = _a.sent();
                    console.error("Unable to fetch credentials from AWS metadata store (" + metadataUrl + "/iam/security-credentials/): " + error_1);
                    return [2 /*return*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if the provided string is an S3 endpoint (can be any region).
 *
 * @param endpoint minio endpoint to check.
 */
function isS3Endpoint(endpoint) {
    if (endpoint === void 0) { endpoint = ''; }
    return !!endpoint.match(/s3.{0,}\.amazonaws\.com\.?.{0,}/i);
}
exports.isS3Endpoint = isS3Endpoint;
/**
 * Class to handle the session credentials for AWS ec2 instance profile.
 */
var AWSInstanceProfileCredentials = /** @class */ (function () {
    function AWSInstanceProfileCredentials() {
        this._expiration = 0;
    }
    /** reset all caches */
    AWSInstanceProfileCredentials.prototype.reset = function () {
        this._iamProfile = undefined;
        this._credentials = undefined;
        this._expiration = 0;
        return this;
    };
    /**
     * EC2 Instance profile
     */
    AWSInstanceProfileCredentials.prototype.profile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this._iamProfile) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, getIAMInstanceProfile()];
                    case 2:
                        _a._iamProfile = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _b.sent();
                        console.error(err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, this._iamProfile];
                }
            });
        });
    };
    /**
     * Return true only if there is a metadata store and instance profile.
     */
    AWSInstanceProfileCredentials.prototype.ok = function () {
        return __awaiter(this, void 0, void 0, function () {
            var profile, _1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.profile()];
                    case 1:
                        profile = _a.sent();
                        return [2 /*return*/, profile && profile.length > 0];
                    case 2:
                        _1 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AWSInstanceProfileCredentials.prototype._fetchCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            var profile, resp, credentials, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.profile()];
                    case 1:
                        profile = _a.sent();
                        return [4 /*yield*/, node_fetch_1.default(metadataUrl + "/iam/security-credentials/" + profile)];
                    case 2:
                        resp = _a.sent();
                        return [4 /*yield*/, resp.json()];
                    case 3:
                        credentials = _a.sent();
                        return [2 /*return*/, credentials];
                    case 4:
                        error_2 = _a.sent();
                        console.error("Unable to fetch credentials from AWS metadata store: " + error_2);
                        return [2 /*return*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the AWS metadata store session credentials.
     */
    AWSInstanceProfileCredentials.prototype.getCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(Date.now() + 10 >= this._expiration || !this._credentials)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this._fetchCredentials()];
                    case 1:
                        _a._credentials = _b.sent();
                        if (this._credentials && this._credentials.Expiration) {
                            this._expiration = new Date(this._credentials.Expiration).getTime();
                        }
                        else {
                            this._expiration = -1; // always retry
                        }
                        _b.label = 2;
                    case 2: return [2 /*return*/, this._credentials];
                }
            });
        });
    };
    return AWSInstanceProfileCredentials;
}());
exports.awsInstanceProfileCredentials = new AWSInstanceProfileCredentials();
//# sourceMappingURL=aws-helper.js.map