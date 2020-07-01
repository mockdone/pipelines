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
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Returns the url to the ml-pipeline api server healthz endpoint
 * (of form: `${apiServerAddress}/${apiVersionPrefix}/healthz`).
 * @param apiServerAddress address for the ml-pipeline api server.
 * @param apiVersionPrefix prefix to append to the route.
 */
function getHealthzEndpoint(apiServerAddress, apiVersionPrefix) {
    return apiServerAddress + "/" + apiVersionPrefix + "/healthz";
}
exports.getHealthzEndpoint = getHealthzEndpoint;
/**
 * Returns the build date and frontend commit hash.
 * @param currentDir path to the metadata files (BUILD_DATE, COMMIT_HASH).
 */
function getBuildMetadata(currentDir) {
    if (currentDir === void 0) { currentDir = path.resolve(__dirname); }
    var buildDatePath = path.join(currentDir, 'BUILD_DATE');
    var commitHashPath = path.join(currentDir, 'COMMIT_HASH');
    var tagNamePath = path.join(currentDir, 'TAG_NAME');
    var buildDate = fs.existsSync(buildDatePath)
        ? fs.readFileSync(buildDatePath, 'utf-8').trim()
        : '';
    var frontendCommitHash = fs.existsSync(commitHashPath)
        ? fs.readFileSync(commitHashPath, 'utf-8').trim()
        : '';
    var frontendTagName = fs.existsSync(tagNamePath)
        ? fs.readFileSync(tagNamePath, 'utf-8').trim()
        : '';
    return {
        buildDate: buildDate,
        frontendCommitHash: frontendCommitHash,
        frontendTagName: frontendTagName,
    };
}
exports.getBuildMetadata = getBuildMetadata;
/**
 * Returns a handler which return the current state of the server.
 * @param options.healthzStats  partial health stats to be enriched with ml-pipeline metadata.
 * @param options.healthzEndpoint healthz endpoint for the ml-pipeline api server.
 */
function getHealthzHandler(options) {
    var _this = this;
    var _a = options.healthzStats, healthzStats = _a === void 0 ? {} : _a, healthzEndpoint = options.healthzEndpoint;
    return function (_, res) { return __awaiter(_this, void 0, void 0, function () {
        var response, serverStatus, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, node_fetch_1.default(healthzEndpoint, {
                            timeout: 1000,
                        })];
                case 1:
                    response = _a.sent();
                    healthzStats.apiServerReady = true;
                    return [4 /*yield*/, response.json()];
                case 2:
                    serverStatus = _a.sent();
                    healthzStats.apiServerCommitHash = serverStatus.commit_sha;
                    healthzStats.apiServerTagName = serverStatus.tag_name;
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    healthzStats.apiServerReady = false;
                    return [3 /*break*/, 4];
                case 4:
                    res.json(healthzStats);
                    return [2 /*return*/];
            }
        });
    }); };
}
exports.getHealthzHandler = getHealthzHandler;
//# sourceMappingURL=healthz.js.map