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
var stream_1 = require("stream");
var minio_1 = require("minio");
var workflow_helper_1 = require("./workflow-helper");
var k8s_helper_1 = require("./k8s-helper");
jest.mock('minio');
jest.mock('./k8s-helper');
describe('workflow-helper', function () {
    var minioConfig = {
        accessKey: 'minio',
        endPoint: 'minio-service.kubeflow',
        secretKey: 'minio123',
    };
    beforeEach(function () {
        jest.resetAllMocks();
    });
    describe('composePodLogsStreamHandler', function () {
        it('returns the stream from the default handler if there is no errors.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var defaultStream, defaultHandler, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        defaultStream = new stream_1.PassThrough();
                        defaultHandler = jest.fn(function (_podName, _namespace) {
                            return Promise.resolve(defaultStream);
                        });
                        return [4 /*yield*/, workflow_helper_1.composePodLogsStreamHandler(defaultHandler)('podName', 'namespace')];
                    case 1:
                        stream = _a.sent();
                        expect(defaultHandler).toBeCalledWith('podName', 'namespace');
                        expect(stream).toBe(defaultStream);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns the stream from the fallback handler if there is any error.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fallbackStream, defaultHandler, fallbackHandler, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fallbackStream = new stream_1.PassThrough();
                        defaultHandler = jest.fn(function (_podName, _namespace) {
                            return Promise.reject('unknown error');
                        });
                        fallbackHandler = jest.fn(function (_podName, _namespace) {
                            return Promise.resolve(fallbackStream);
                        });
                        return [4 /*yield*/, workflow_helper_1.composePodLogsStreamHandler(defaultHandler, fallbackHandler)('podName', 'namespace')];
                    case 1:
                        stream = _a.sent();
                        expect(defaultHandler).toBeCalledWith('podName', 'namespace');
                        expect(fallbackHandler).toBeCalledWith('podName', 'namespace');
                        expect(stream).toBe(fallbackStream);
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws error if both handler and fallback fails.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var defaultHandler, fallbackHandler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        defaultHandler = jest.fn(function (_podName, _namespace) {
                            return Promise.reject('unknown error for default');
                        });
                        fallbackHandler = jest.fn(function (_podName, _namespace) {
                            return Promise.reject('unknown error for fallback');
                        });
                        return [4 /*yield*/, expect(workflow_helper_1.composePodLogsStreamHandler(defaultHandler, fallbackHandler)('podName', 'namespace')).rejects.toEqual('unknown error for fallback')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getPodLogsStreamFromK8s', function () {
        it('returns the pod log stream using k8s api.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockedGetPodLogs, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockedGetPodLogs = k8s_helper_1.getPodLogs;
                        mockedGetPodLogs.mockResolvedValueOnce('pod logs');
                        return [4 /*yield*/, workflow_helper_1.getPodLogsStreamFromK8s('podName', 'namespace')];
                    case 1:
                        stream = _a.sent();
                        expect(mockedGetPodLogs).toBeCalledWith('podName', 'namespace');
                        expect(stream.read().toString()).toBe('pod logs');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('toGetPodLogsStream', function () {
        it('wraps a getMinioRequestConfig function to return the corresponding object stream.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var objStream, client, mockedClientGetObject, configs, createRequest, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        objStream = new stream_1.PassThrough();
                        objStream.end('some fake logs.');
                        client = new minio_1.Client(minioConfig);
                        mockedClientGetObject = client.getObject;
                        mockedClientGetObject.mockResolvedValueOnce(objStream);
                        configs = {
                            bucket: 'bucket',
                            client: client,
                            key: 'folder/key',
                        };
                        createRequest = jest.fn(function (_podName, _namespace) {
                            return Promise.resolve(configs);
                        });
                        return [4 /*yield*/, workflow_helper_1.toGetPodLogsStream(createRequest)('podName', 'namespace')];
                    case 1:
                        stream = _a.sent();
                        expect(mockedClientGetObject).toBeCalledWith('bucket', 'folder/key');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('createPodLogsMinioRequestConfig', function () {
        it('returns a MinioRequestConfig factory with the provided minioClientOptions, bucket, and prefix.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockedClient, requestFunc, request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockedClient = minio_1.Client;
                        return [4 /*yield*/, workflow_helper_1.createPodLogsMinioRequestConfig(minioConfig, 'bucket', 'prefix')];
                    case 1:
                        requestFunc = _a.sent();
                        return [4 /*yield*/, requestFunc('workflow-name-abc', 'namespace')];
                    case 2:
                        request = _a.sent();
                        expect(mockedClient).toBeCalledWith(minioConfig);
                        expect(request.client).toBeInstanceOf(minio_1.Client);
                        expect(request.bucket).toBe('bucket');
                        expect(request.key).toBe('prefix/workflow-name/workflow-name-abc/main.log');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getPodLogsStreamFromWorkflow', function () {
        it('returns a getPodLogsStream function that retrieves an object stream using the workflow status corresponding to the pod name.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sampleWorkflow, mockedGetArgoWorkflow, mockedGetK8sSecret, objStream, mockedClient, mockedClientGetObject, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sampleWorkflow = {
                            apiVersion: 'argoproj.io/v1alpha1',
                            kind: 'Workflow',
                            status: {
                                nodes: {
                                    'workflow-name-abc': {
                                        outputs: {
                                            artifacts: [
                                                {
                                                    name: 'some-artifact.csv',
                                                    s3: {
                                                        accessKeySecret: { key: 'accessKey', name: 'accessKeyName' },
                                                        bucket: 'bucket',
                                                        endpoint: 'minio-service.kubeflow',
                                                        insecure: true,
                                                        key: 'prefix/workflow-name/workflow-name-abc/some-artifact.csv',
                                                        secretKeySecret: { key: 'secretKey', name: 'secretKeyName' },
                                                    },
                                                },
                                                {
                                                    archiveLogs: true,
                                                    name: 'main.log',
                                                    s3: {
                                                        accessKeySecret: { key: 'accessKey', name: 'accessKeyName' },
                                                        bucket: 'bucket',
                                                        endpoint: 'minio-service.kubeflow',
                                                        insecure: true,
                                                        key: 'prefix/workflow-name/workflow-name-abc/main.log',
                                                        secretKeySecret: { key: 'secretKey', name: 'secretKeyName' },
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        };
                        mockedGetArgoWorkflow = k8s_helper_1.getArgoWorkflow;
                        mockedGetArgoWorkflow.mockResolvedValueOnce(sampleWorkflow);
                        mockedGetK8sSecret = k8s_helper_1.getK8sSecret;
                        mockedGetK8sSecret.mockResolvedValue('someSecret');
                        objStream = new stream_1.PassThrough();
                        mockedClient = minio_1.Client;
                        mockedClientGetObject = minio_1.Client.prototype.getObject;
                        mockedClientGetObject.mockResolvedValueOnce(objStream);
                        objStream.end('some fake logs.');
                        return [4 /*yield*/, workflow_helper_1.getPodLogsStreamFromWorkflow('workflow-name-abc')];
                    case 1:
                        stream = _a.sent();
                        expect(mockedGetArgoWorkflow).toBeCalledWith('workflow-name');
                        expect(mockedGetK8sSecret).toBeCalledTimes(2);
                        expect(mockedGetK8sSecret).toBeCalledWith('accessKeyName', 'accessKey');
                        expect(mockedGetK8sSecret).toBeCalledWith('secretKeyName', 'secretKey');
                        expect(mockedClient).toBeCalledTimes(1);
                        expect(mockedClient).toBeCalledWith({
                            accessKey: 'someSecret',
                            endPoint: 'minio-service.kubeflow',
                            port: 80,
                            secretKey: 'someSecret',
                            useSSL: false,
                        });
                        expect(mockedClientGetObject).toBeCalledTimes(1);
                        expect(mockedClientGetObject).toBeCalledWith('bucket', 'prefix/workflow-name/workflow-name-abc/main.log');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=workflow-helper.test.js.map