"use strict";
// Copyright 2018 Google LLC
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
var client_node_1 = require("@kubernetes/client-node");
var crypto = __importStar(require("crypto-js"));
var fs = __importStar(require("fs"));
var utils_1 = require("./utils");
// If this is running inside a k8s Pod, its namespace should be written at this
// path, this is also how we can tell whether we're running in the cluster.
var namespaceFilePath = '/var/run/secrets/kubernetes.io/serviceaccount/namespace';
var serverNamespace = undefined;
// Constants for creating customer resource Viewer.
var viewerGroup = 'kubeflow.org';
var viewerVersion = 'v1beta1';
var viewerPlural = 'viewers';
// Constants for argo workflow
var workflowGroup = 'argoproj.io';
var workflowVersion = 'v1alpha1';
var workflowPlural = 'workflows';
/** Default pod template spec used to create tensorboard viewer. */
exports.defaultPodTemplateSpec = {
    spec: {
        containers: [{}],
    },
};
// The file path contains pod namespace when in Kubernetes cluster.
if (fs.existsSync(namespaceFilePath)) {
    serverNamespace = fs.readFileSync(namespaceFilePath, 'utf-8');
}
var kc = new client_node_1.KubeConfig();
// This loads kubectl config when not in cluster.
kc.loadFromDefault();
var k8sV1Client = kc.makeApiClient(client_node_1.Core_v1Api);
var k8sV1CustomObjectClient = kc.makeApiClient(client_node_1.Custom_objectsApi);
function getNameOfViewerResource(logdir) {
    // TODO: find some hash function with shorter resulting message.
    return 'viewer-' + crypto.SHA1(logdir);
}
/**
 * Create Tensorboard instance via CRD with the given logdir if there is no
 * existing Tensorboard instance.
 */
function newTensorboardInstance(logdir, namespace, tfImageName, tfversion, podTemplateSpec) {
    if (podTemplateSpec === void 0) { podTemplateSpec = exports.defaultPodTemplateSpec; }
    return __awaiter(this, void 0, void 0, function () {
        var currentPod, body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTensorboardInstance(logdir, namespace)];
                case 1:
                    currentPod = _a.sent();
                    if (currentPod.podAddress) {
                        if (tfversion === currentPod.tfVersion) {
                            return [2 /*return*/];
                        }
                        else {
                            throw new Error("There's already an existing tensorboard instance with a different version " + currentPod.tfVersion);
                        }
                    }
                    body = {
                        apiVersion: viewerGroup + '/' + viewerVersion,
                        kind: 'Viewer',
                        metadata: {
                            name: getNameOfViewerResource(logdir),
                            namespace: namespace,
                        },
                        spec: {
                            podTemplateSpec: podTemplateSpec,
                            tensorboardSpec: {
                                logDir: logdir,
                                tensorflowImage: tfImageName + ':' + tfversion,
                            },
                            type: 'tensorboard',
                        },
                    };
                    return [4 /*yield*/, k8sV1CustomObjectClient.createNamespacedCustomObject(viewerGroup, viewerVersion, namespace, viewerPlural, body)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.newTensorboardInstance = newTensorboardInstance;
/**
 * Finds a running Tensorboard instance created via CRD with the given logdir
 * and returns its dns address and its version
 */
function getTensorboardInstance(logdir, namespace) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, k8sV1CustomObjectClient
                        .getNamespacedCustomObject(viewerGroup, viewerVersion, namespace, viewerPlural, getNameOfViewerResource(logdir))
                        .then(
                    // Viewer CRD pod has tensorboard instance running at port 6006 while
                    // viewer CRD service has tensorboard instance running at port 80. Since
                    // we return service address here (instead of pod address), so use 80.
                    function (viewer) {
                        if (viewer &&
                            viewer.body &&
                            viewer.body.spec.tensorboardSpec.logDir === logdir &&
                            viewer.body.spec.type === 'tensorboard') {
                            var address = "http://" + viewer.body.metadata.name + "-service." + namespace + ".svc.cluster.local:80/tensorboard/" + viewer.body.metadata.name + "/";
                            var tfImageParts = viewer.body.spec.tensorboardSpec.tensorflowImage.split(':', 2);
                            var tfVersion = tfImageParts.length == 2 ? tfImageParts[1] : '';
                            return { podAddress: address, tfVersion: tfVersion };
                        }
                        else {
                            return { podAddress: '', tfVersion: '' };
                        }
                    }, 
                    // No existing custom object with the given name, i.e., no existing
                    // tensorboard instance.
                    function (err) {
                        // This is often expected, so only use debug level for logging.
                        console.debug("Failed getting viewer custom object for logdir=" + logdir + " in " + namespace + " namespace, err: ", (err === null || err === void 0 ? void 0 : err.body) || err);
                        return { podAddress: '', tfVersion: '' };
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getTensorboardInstance = getTensorboardInstance;
/**
 * Find a running Tensorboard instance with the given logdir, delete the instance
 * and returns the deleted podAddress
 */
function deleteTensorboardInstance(logdir, namespace) {
    return __awaiter(this, void 0, void 0, function () {
        var currentPod, viewerName, deleteOption;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTensorboardInstance(logdir, namespace)];
                case 1:
                    currentPod = _a.sent();
                    if (!currentPod.podAddress) {
                        return [2 /*return*/];
                    }
                    viewerName = getNameOfViewerResource(logdir);
                    deleteOption = new client_node_1.V1DeleteOptions();
                    return [4 /*yield*/, k8sV1CustomObjectClient.deleteNamespacedCustomObject(viewerGroup, viewerVersion, namespace, viewerPlural, viewerName, deleteOption)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteTensorboardInstance = deleteTensorboardInstance;
/**
 * Polls every second for a running Tensorboard instance with the given logdir,
 * and returns the address of one if found, or rejects if a timeout expires.
 */
function waitForTensorboardInstance(logdir, namespace, timeout) {
    var _this = this;
    var start = Date.now();
    return new Promise(function (resolve, reject) {
        var handle = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var tensorboardInstance, tensorboardAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (Date.now() - start > timeout) {
                            clearInterval(handle);
                            reject('Timed out waiting for tensorboard');
                        }
                        return [4 /*yield*/, getTensorboardInstance(logdir, namespace)];
                    case 1:
                        tensorboardInstance = _a.sent();
                        tensorboardAddress = tensorboardInstance.podAddress;
                        if (tensorboardAddress) {
                            clearInterval(handle);
                            resolve(tensorboardAddress);
                        }
                        return [2 /*return*/];
                }
            });
        }); }, 1000);
    });
}
exports.waitForTensorboardInstance = waitForTensorboardInstance;
function getPodLogs(podName, podNamespace) {
    podNamespace = podNamespace || serverNamespace;
    if (!podNamespace) {
        throw new Error("podNamespace is not specified and cannot get namespace from " + namespaceFilePath + ".");
    }
    return k8sV1Client.readNamespacedPodLog(podName, podNamespace, 'main').then(function (response) { return (response && response.body ? response.body.toString() : ''); }, function (error) {
        throw new Error(JSON.stringify(error.body));
    });
}
exports.getPodLogs = getPodLogs;
function getPod(podName, podNamespace) {
    return __awaiter(this, void 0, void 0, function () {
        var body, error_1, _a, message, additionalInfo, userMessage;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 4]);
                    return [4 /*yield*/, k8sV1Client.readNamespacedPod(podName, podNamespace)];
                case 1:
                    body = (_b.sent()).body;
                    return [2 /*return*/, [body, undefined]];
                case 2:
                    error_1 = _b.sent();
                    return [4 /*yield*/, utils_1.parseError(error_1)];
                case 3:
                    _a = _b.sent(), message = _a.message, additionalInfo = _a.additionalInfo;
                    userMessage = "Could not get pod " + podName + " in namespace " + podNamespace + ": " + message;
                    return [2 /*return*/, [undefined, { message: userMessage, additionalInfo: additionalInfo }]];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getPod = getPod;
function listPodEvents(podName, podNamespace) {
    return __awaiter(this, void 0, void 0, function () {
        var body, error_2, _a, message, additionalInfo, userMessage;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 4]);
                    return [4 /*yield*/, k8sV1Client.listNamespacedEvent(podNamespace, undefined, undefined, undefined, 
                        // The following fieldSelector can be found when running
                        // `kubectl describe <pod-name> -v 8`
                        // (-v 8) will verbosely print network requests sent by kubectl.
                        "involvedObject.namespace=" + podNamespace + ",involvedObject.name=" + podName + ",involvedObject.kind=Pod")];
                case 1:
                    body = (_b.sent()).body;
                    return [2 /*return*/, [body, undefined]];
                case 2:
                    error_2 = _b.sent();
                    return [4 /*yield*/, utils_1.parseError(error_2)];
                case 3:
                    _a = _b.sent(), message = _a.message, additionalInfo = _a.additionalInfo;
                    userMessage = "Error when listing pod events for pod \"" + podName + "\" in \"" + podNamespace + "\" namespace: " + message;
                    return [2 /*return*/, [undefined, { message: userMessage, additionalInfo: additionalInfo }]];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.listPodEvents = listPodEvents;
/**
 * Retrieves the argo workflow CRD.
 * @param workflowName name of the argo workflow
 */
function getArgoWorkflow(workflowName) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!serverNamespace) {
                        throw new Error("Cannot get namespace from " + namespaceFilePath);
                    }
                    return [4 /*yield*/, k8sV1CustomObjectClient.getNamespacedCustomObject(workflowGroup, workflowVersion, serverNamespace, workflowPlural, workflowName)];
                case 1:
                    res = _a.sent();
                    if (res.response.statusCode == null) {
                        throw new Error("Unable to query workflow:" + workflowName + ": No status code present.");
                    }
                    if (res.response.statusCode >= 400) {
                        throw new Error("Unable to query workflow:" + workflowName + ": Access denied.");
                    }
                    return [2 /*return*/, res.body];
            }
        });
    });
}
exports.getArgoWorkflow = getArgoWorkflow;
/**
 * Retrieves k8s secret by key and decode from base64.
 * @param name name of the secret
 * @param key key in the secret
 */
function getK8sSecret(name, key) {
    return __awaiter(this, void 0, void 0, function () {
        var k8sSecret, secretb64, buff;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!serverNamespace) {
                        throw new Error("Cannot get namespace from " + namespaceFilePath);
                    }
                    return [4 /*yield*/, k8sV1Client.readNamespacedSecret(name, serverNamespace)];
                case 1:
                    k8sSecret = _a.sent();
                    secretb64 = k8sSecret.body.data[key];
                    buff = new Buffer(secretb64, 'base64');
                    return [2 /*return*/, buff.toString('ascii')];
            }
        });
    });
}
exports.getK8sSecret = getK8sSecret;
exports.TEST_ONLY = {
    k8sV1Client: k8sV1Client,
    k8sV1CustomObjectClient: k8sV1CustomObjectClient,
};
//# sourceMappingURL=k8s-helper.js.map