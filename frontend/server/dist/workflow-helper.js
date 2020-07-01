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
var path_1 = __importDefault(require("path"));
var stream_1 = require("stream");
var k8s_helper_1 = require("./k8s-helper");
var minio_helper_1 = require("./minio-helper");
/**
 * Compose a pod logs stream handler - i.e. a stream handler returns a stream
 * containing the pod logs.
 * @param handler a function that returns a stream.
 * @param fallback a fallback function that returns a stream if the initial handler
 * fails.
 */
function composePodLogsStreamHandler(handler, fallback) {
    var _this = this;
    return function (podName, namespace) { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 5]);
                    return [4 /*yield*/, handler(podName, namespace)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    err_1 = _a.sent();
                    if (!fallback) return [3 /*break*/, 4];
                    return [4 /*yield*/, fallback(podName, namespace)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    console.warn(err_1);
                    throw err_1;
                case 5: return [2 /*return*/];
            }
        });
    }); };
}
exports.composePodLogsStreamHandler = composePodLogsStreamHandler;
/**
 * Returns a stream containing the pod logs using kubernetes api.
 * @param podName name of the pod.
 * @param namespace namespace of the pod (uses the same namespace as the server if not provided).
 */
function getPodLogsStreamFromK8s(podName, namespace) {
    return __awaiter(this, void 0, void 0, function () {
        var stream, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    stream = new stream_1.PassThrough();
                    _b = (_a = stream).end;
                    return [4 /*yield*/, k8s_helper_1.getPodLogs(podName, namespace)];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    console.log("Getting logs for pod:" + podName + " in namespace " + namespace + ".");
                    return [2 /*return*/, stream];
            }
        });
    });
}
exports.getPodLogsStreamFromK8s = getPodLogsStreamFromK8s;
/**
 * Returns a stream containing the pod logs using the information provided in the
 * workflow status (uses k8s api to retrieve the workflow and secrets).
 * @param podName name of the pod.
 * @param namespace namespace of the pod (uses the same namespace as the server if not provided).
 */
exports.getPodLogsStreamFromWorkflow = toGetPodLogsStream(getPodLogsMinioRequestConfigfromWorkflow);
/**
 * Returns a function that retrieves the pod log streams using the provided
 * getMinioRequestConfig function (a MinioRequestConfig object specifies the
 * artifact bucket and key, with the corresponding minio client).
 * @param getMinioRequestConfig function that returns a MinioRequestConfig based
 * on the provided pod name and namespace (optional).
 */
function toGetPodLogsStream(getMinioRequestConfig) {
    var _this = this;
    return function (podName, namespace) { return __awaiter(_this, void 0, void 0, function () {
        var request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMinioRequestConfig(podName, namespace)];
                case 1:
                    request = _a.sent();
                    console.log("Getting logs for pod:" + podName + " from " + request.bucket + "/" + request.key + ".");
                    return [4 /*yield*/, minio_helper_1.getObjectStream(request)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
}
exports.toGetPodLogsStream = toGetPodLogsStream;
/**
 * Returns a MinioRequestConfig with the provided minio options (a MinioRequestConfig
 * object contains the artifact bucket and keys, with the corresponding minio
 * client).
 * @param minioOptions Minio options to create a minio client.
 * @param bucket bucket containing the pod logs artifacts.
 * @param prefix prefix for pod logs artifacts stored in the bucket.
 */
function createPodLogsMinioRequestConfig(minioOptions, bucket, prefix) {
    var _this = this;
    // TODO: support pod log artifacts for diff namespace.
    // different bucket/prefix for diff namespace?
    return function (podName, _namespace) { return __awaiter(_this, void 0, void 0, function () {
        var client, workflowName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, minio_helper_1.createMinioClient(minioOptions)];
                case 1:
                    client = _a.sent();
                    workflowName = workflowNameFromPodName(podName);
                    return [2 /*return*/, {
                            bucket: bucket,
                            client: client,
                            key: path_1.default.join(prefix, workflowName, podName, 'main.log'),
                        }];
            }
        });
    }); };
}
exports.createPodLogsMinioRequestConfig = createPodLogsMinioRequestConfig;
/**
 * Retrieves the bucket and pod log artifact key (as well as the
 * minio client need to retrieve them) from the corresponding argo workflow status.
 *
 * @param podName name of the pod to retrieve the logs.
 */
function getPodLogsMinioRequestConfigfromWorkflow(podName) {
    return __awaiter(this, void 0, void 0, function () {
        var workflow, err_2, artifacts, node, archiveLogs, s3Artifact, _a, host, port, _b, accessKey, secretKey, client;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, k8s_helper_1.getArgoWorkflow(workflowNameFromPodName(podName))];
                case 1:
                    workflow = _c.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _c.sent();
                    throw new Error("Unable to retrieve workflow status: " + err_2 + ".");
                case 3:
                    // check if required fields are available
                    if (workflow.status && workflow.status.nodes) {
                        node = workflow.status.nodes[podName];
                        if (node && node.outputs && node.outputs.artifacts) {
                            artifacts = node.outputs.artifacts;
                        }
                    }
                    if (!artifacts) {
                        throw new Error('Unable to find pod info in workflow status to retrieve logs.');
                    }
                    archiveLogs = artifacts.filter(function (artifact) { return artifact.archiveLogs; });
                    if (archiveLogs.length === 0) {
                        throw new Error('Unable to find pod log archive information from workflow status.');
                    }
                    s3Artifact = archiveLogs[0].s3;
                    if (!s3Artifact) {
                        throw new Error('Unable to find s3 artifact info from workflow status.');
                    }
                    _a = urlSplit(s3Artifact.endpoint, s3Artifact.insecure), host = _a.host, port = _a.port;
                    return [4 /*yield*/, getMinioClientSecrets(s3Artifact)];
                case 4:
                    _b = _c.sent(), accessKey = _b.accessKey, secretKey = _b.secretKey;
                    return [4 /*yield*/, minio_helper_1.createMinioClient({
                            accessKey: accessKey,
                            endPoint: host,
                            port: port,
                            secretKey: secretKey,
                            useSSL: !s3Artifact.insecure,
                        })];
                case 5:
                    client = _c.sent();
                    return [2 /*return*/, {
                            bucket: s3Artifact.bucket,
                            client: client,
                            key: s3Artifact.key,
                        }];
            }
        });
    });
}
exports.getPodLogsMinioRequestConfigfromWorkflow = getPodLogsMinioRequestConfigfromWorkflow;
/**
 * Returns the k8s access key and secret used to connect to the s3 artifactory.
 * @param s3artifact s3artifact object describing the s3 artifactory config for argo workflow.
 */
function getMinioClientSecrets(_a) {
    var accessKeySecret = _a.accessKeySecret, secretKeySecret = _a.secretKeySecret;
    return __awaiter(this, void 0, void 0, function () {
        var accessKey, secretKey;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!accessKeySecret || !secretKeySecret) {
                        return [2 /*return*/, {}];
                    }
                    return [4 /*yield*/, k8s_helper_1.getK8sSecret(accessKeySecret.name, accessKeySecret.key)];
                case 1:
                    accessKey = _b.sent();
                    return [4 /*yield*/, k8s_helper_1.getK8sSecret(secretKeySecret.name, secretKeySecret.key)];
                case 2:
                    secretKey = _b.sent();
                    return [2 /*return*/, { accessKey: accessKey, secretKey: secretKey }];
            }
        });
    });
}
/**
 * Split an uri into host and port.
 * @param uri uri to split
 * @param insecure if port is not provided in uri, return port depending on whether ssl is enabled.
 */
function urlSplit(uri, insecure) {
    var chunks = uri.split(':');
    if (chunks.length === 1) {
        return { host: chunks[0], port: insecure ? 80 : 443 };
    }
    return { host: chunks[0], port: parseInt(chunks[1], 10) };
}
/**
 * Infers workflow name from pod name.
 * @param podName name of the pod.
 */
function workflowNameFromPodName(podName) {
    var chunks = podName.split('-');
    chunks.pop();
    return chunks.join('-');
}
//# sourceMappingURL=workflow-helper.js.map