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
// Copyright 2019-2020 Google LLC
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
var minio_1 = require("minio");
var utils_1 = require("../utils");
var minio_helper_1 = require("../minio-helper");
var storage_1 = require("@google-cloud/storage");
var http_proxy_middleware_1 = __importDefault(require("http-proxy-middleware"));
/**
 * Returns an artifact handler which retrieve an artifact from the corresponding
 * backend (i.e. gcs, minio, s3, http/https).
 * @param artifactsConfigs configs to retrieve the artifacts from the various backend.
 */
function getArtifactsHandler(artifactsConfigs) {
    var _this = this;
    var aws = artifactsConfigs.aws, http = artifactsConfigs.http, minio = artifactsConfigs.minio;
    return function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, source, bucket, encodedKey, _b, peek, key, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _a = req.query, source = _a.source, bucket = _a.bucket, encodedKey = _a.key, _b = _a.peek, peek = _b === void 0 ? 0 : _b;
                    if (!source) {
                        res.status(500).send('Storage source is missing from artifact request');
                        return [2 /*return*/];
                    }
                    if (!bucket) {
                        res.status(500).send('Storage bucket is missing from artifact request');
                        return [2 /*return*/];
                    }
                    if (!encodedKey) {
                        res.status(500).send('Storage key is missing from artifact request');
                        return [2 /*return*/];
                    }
                    key = decodeURIComponent(encodedKey);
                    console.log("Getting storage artifact at: " + source + ": " + bucket + "/" + key);
                    _c = source;
                    switch (_c) {
                        case 'gcs': return [3 /*break*/, 1];
                        case 'minio': return [3 /*break*/, 2];
                        case 's3': return [3 /*break*/, 3];
                        case 'http': return [3 /*break*/, 5];
                        case 'https': return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 6];
                case 1:
                    getGCSArtifactHandler({ bucket: bucket, key: key }, peek)(req, res);
                    return [3 /*break*/, 7];
                case 2:
                    getMinioArtifactHandler({
                        bucket: bucket,
                        client: new minio_1.Client(minio),
                        key: key,
                    }, peek)(req, res);
                    return [3 /*break*/, 7];
                case 3:
                    _d = getMinioArtifactHandler;
                    _e = {
                        bucket: bucket
                    };
                    return [4 /*yield*/, minio_helper_1.createMinioClient(aws)];
                case 4:
                    _d.apply(void 0, [(_e.client = _f.sent(),
                            _e.key = key,
                            _e), peek])(req, res);
                    return [3 /*break*/, 7];
                case 5:
                    getHttpArtifactsHandler(getHttpUrl(source, http.baseUrl || '', bucket, key), http.auth, peek)(req, res);
                    return [3 /*break*/, 7];
                case 6:
                    res.status(500).send('Unknown storage source: ' + source);
                    return [2 /*return*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
}
exports.getArtifactsHandler = getArtifactsHandler;
/**
 * Returns the http/https url to retrieve a kfp artifact (of the form: `${source}://${baseUrl}${bucket}/${key}`)
 * @param source "http" or "https".
 * @param baseUrl string to prefix the url.
 * @param bucket name of the bucket.
 * @param key path to the artifact.
 */
function getHttpUrl(source, baseUrl, bucket, key) {
    // trim `/` from both ends of the base URL, then append with a single `/` to the end (empty string remains empty)
    baseUrl = baseUrl.replace(/^\/*(.+?)\/*$/, '$1/');
    return source + "://" + baseUrl + bucket + "/" + key;
}
function getHttpArtifactsHandler(url, auth, peek) {
    var _this = this;
    if (auth === void 0) { auth = { key: '', defaultValue: '' }; }
    if (peek === void 0) { peek = 0; }
    return function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var headers, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    headers = {};
                    // add authorization header to fetch request if key is non-empty
                    if (auth.key.length > 0) {
                        // inject original request's value if exists, otherwise default to provided default value
                        headers[auth.key] =
                            req.headers[auth.key] || req.headers[auth.key.toLowerCase()] || auth.defaultValue;
                    }
                    return [4 /*yield*/, node_fetch_1.default(url, { headers: headers })];
                case 1:
                    response = _a.sent();
                    response.body
                        .on('error', function (err) { return res.status(500).send("Unable to retrieve artifact at " + url + ": " + err); })
                        .pipe(new utils_1.PreviewStream({ peek: peek }))
                        .pipe(res);
                    return [2 /*return*/];
            }
        });
    }); };
}
function getMinioArtifactHandler(options, peek) {
    var _this = this;
    if (peek === void 0) { peek = 0; }
    return function (_, res) { return __awaiter(_this, void 0, void 0, function () {
        var stream, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, minio_helper_1.getObjectStream(options)];
                case 1:
                    stream = _a.sent();
                    stream
                        .on('error', function (err) {
                        return res
                            .status(500)
                            .send("Failed to get object in bucket " + options.bucket + " at path " + options.key + ": " + err);
                    })
                        .pipe(new utils_1.PreviewStream({ peek: peek }))
                        .pipe(res);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    res
                        .status(500)
                        .send("Failed to get object in bucket " + options.bucket + " at path " + options.key + ": " + err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
}
function getGCSArtifactHandler(options, peek) {
    var _this = this;
    if (peek === void 0) { peek = 0; }
    var key = options.key, bucket = options.bucket;
    return function (_, res) { return __awaiter(_this, void 0, void 0, function () {
        var storage, prefix, files, matchingFiles_1, contents_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    storage = new storage_1.Storage();
                    prefix = key.indexOf('*') > -1 ? key.substr(0, key.indexOf('*')) : key;
                    return [4 /*yield*/, storage.bucket(bucket).getFiles({ prefix: prefix })];
                case 1:
                    files = _a.sent();
                    matchingFiles_1 = files[0].filter(function (f) {
                        // Escape regex characters
                        var escapeRegexChars = function (s) { return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'); };
                        // Build a RegExp object that only recognizes asterisks ('*'), and
                        // escapes everything else.
                        var regex = new RegExp('^' +
                            key
                                .split(/\*+/)
                                .map(escapeRegexChars)
                                .join('.*') +
                            '$');
                        return regex.test(f.name);
                    });
                    if (!matchingFiles_1.length) {
                        console.log('No matching files found.');
                        res.send();
                        return [2 /*return*/];
                    }
                    console.log("Found " + matchingFiles_1.length + " matching files: ", matchingFiles_1.map(function (file) { return file.name; }).join(','));
                    contents_1 = '';
                    // TODO: support peek for concatenated matching files
                    if (peek) {
                        matchingFiles_1[0]
                            .createReadStream()
                            .pipe(new utils_1.PreviewStream({ peek: peek }))
                            .pipe(res);
                        return [2 /*return*/];
                    }
                    // if not peeking, iterate and append all the files
                    matchingFiles_1.forEach(function (f, i) {
                        var buffer = [];
                        f.createReadStream()
                            .on('data', function (data) { return buffer.push(Buffer.from(data)); })
                            .on('end', function () {
                            contents_1 +=
                                Buffer.concat(buffer)
                                    .toString()
                                    .trim() + '\n';
                            if (i === matchingFiles_1.length - 1) {
                                res.send(contents_1);
                            }
                        })
                            .on('error', function () { return res.status(500).send('Failed to read file: ' + f.name); });
                    });
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    res.status(500).send('Failed to download GCS file(s). Error: ' + err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
}
var ARTIFACTS_PROXY_DEFAULTS = {
    serviceName: 'ml-pipeline-ui-artifact',
    servicePort: '80',
};
function loadArtifactsProxyConfig(env) {
    var _a = env.ARTIFACTS_SERVICE_PROXY_NAME, ARTIFACTS_SERVICE_PROXY_NAME = _a === void 0 ? ARTIFACTS_PROXY_DEFAULTS.serviceName : _a, _b = env.ARTIFACTS_SERVICE_PROXY_PORT, ARTIFACTS_SERVICE_PROXY_PORT = _b === void 0 ? ARTIFACTS_PROXY_DEFAULTS.servicePort : _b, _c = env.ARTIFACTS_SERVICE_PROXY_ENABLED, ARTIFACTS_SERVICE_PROXY_ENABLED = _c === void 0 ? 'false' : _c;
    return {
        serviceName: ARTIFACTS_SERVICE_PROXY_NAME,
        servicePort: parseInt(ARTIFACTS_SERVICE_PROXY_PORT, 10),
        enabled: ARTIFACTS_SERVICE_PROXY_ENABLED.toLowerCase() === 'true',
    };
}
exports.loadArtifactsProxyConfig = loadArtifactsProxyConfig;
var QUERIES = {
    NAMESPACE: 'namespace',
};
function getArtifactsProxyHandler(_a) {
    var enabled = _a.enabled, namespacedServiceGetter = _a.namespacedServiceGetter;
    if (!enabled) {
        return function (req, res, next) { return next(); };
    }
    return http_proxy_middleware_1.default(function (_pathname, req) {
        // only proxy requests with namespace query parameter
        return !!getNamespaceFromUrl(req.url || '');
    }, {
        changeOrigin: true,
        onProxyReq: function (proxyReq) {
            console.log('Proxied artifact request: ', proxyReq.path);
        },
        pathRewrite: function (pathStr, req) {
            var url = new URL(pathStr || '', DUMMY_BASE_PATH);
            url.searchParams.delete(QUERIES.NAMESPACE);
            return url.pathname + url.search;
        },
        router: function (req) {
            var namespace = getNamespaceFromUrl(req.url || '');
            if (!namespace) {
                throw new Error("namespace query param expected in " + req.url + ".");
            }
            return namespacedServiceGetter(namespace);
        },
        target: '/artifacts/get',
    });
}
exports.getArtifactsProxyHandler = getArtifactsProxyHandler;
function getNamespaceFromUrl(path) {
    // Gets namespace from query parameter "namespace"
    var params = new URL(path, DUMMY_BASE_PATH).searchParams;
    return params.get('namespace') || undefined;
}
// `new URL('/path')` doesn't work, because URL only accepts full URL with scheme and hostname.
// We use the DUMMY_BASE_PATH like `new URL('/path', DUMMY_BASE_PATH)`, so that URL can parse paths
// properly.
var DUMMY_BASE_PATH = 'http://dummy-base-path';
function getArtifactServiceGetter(_a) {
    var serviceName = _a.serviceName, servicePort = _a.servicePort;
    return function (namespace) { return "http://" + serviceName + "." + namespace + ":" + servicePort; };
}
exports.getArtifactServiceGetter = getArtifactServiceGetter;
//# sourceMappingURL=artifacts.js.map