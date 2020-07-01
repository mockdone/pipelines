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
var aws_helper_1 = require("./aws-helper");
// mock node-fetch module
jest.mock('node-fetch');
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
beforeEach(function () {
    aws_helper_1.awsInstanceProfileCredentials.reset();
    jest.clearAllMocks();
});
describe('awsInstanceProfileCredentials', function () {
    var mockedFetch = node_fetch_1.default;
    describe('getCredentials', function () {
        it('retrieves, caches, and refreshes the AWS EC2 instance profile and session credentials everytime it is called.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var count, expectedCredentials, mockFetch, _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        count = 0;
                        expectedCredentials = [
                            {
                                AccessKeyId: 'AccessKeyId',
                                Code: 'Success',
                                Expiration: new Date(Date.now() + 1000).toISOString(),
                                LastUpdated: '2019-12-17T10:55:38Z',
                                SecretAccessKey: 'SecretAccessKey',
                                Token: 'SessionToken',
                                Type: 'AWS-HMAC',
                            },
                            {
                                AccessKeyId: 'AccessKeyId2',
                                Code: 'Success',
                                Expiration: new Date(Date.now() + 10000).toISOString(),
                                LastUpdated: '2019-12-17T10:55:38Z',
                                SecretAccessKey: 'SecretAccessKey2',
                                Token: 'SessionToken2',
                                Type: 'AWS-HMAC',
                            },
                        ];
                        mockFetch = function (url) {
                            if (url === 'http://169.254.169.254/latest/meta-data/iam/security-credentials/') {
                                return Promise.resolve({ text: function () { return Promise.resolve('some_iam_role'); } });
                            }
                            return Promise.resolve({
                                json: function () { return Promise.resolve(expectedCredentials[count++]); },
                            });
                        };
                        mockedFetch.mockImplementation(mockFetch);
                        // expect to get cred from ec2 instance metadata store
                        _a = expect;
                        return [4 /*yield*/, aws_helper_1.awsInstanceProfileCredentials.getCredentials()];
                    case 1:
                        // expect to get cred from ec2 instance metadata store
                        _a.apply(void 0, [_e.sent()]).toBe(expectedCredentials[0]);
                        // expect to call once for profile name, and once for credential
                        expect(mockedFetch.mock.calls.length).toBe(2);
                        // expect to get same credential as it has not expire
                        _b = expect;
                        return [4 /*yield*/, aws_helper_1.awsInstanceProfileCredentials.getCredentials()];
                    case 2:
                        // expect to get same credential as it has not expire
                        _b.apply(void 0, [_e.sent()]).toBe(expectedCredentials[0]);
                        // expect to not to have any more calls
                        expect(mockedFetch.mock.calls.length).toBe(2);
                        // let credential expire
                        return [4 /*yield*/, sleep(1500)];
                    case 3:
                        // let credential expire
                        _e.sent();
                        // expect to get new cred as old one expire
                        _c = expect;
                        return [4 /*yield*/, aws_helper_1.awsInstanceProfileCredentials.getCredentials()];
                    case 4:
                        // expect to get new cred as old one expire
                        _c.apply(void 0, [_e.sent()]).toBe(expectedCredentials[1]);
                        // expect to get same cred as it has not expire
                        _d = expect;
                        return [4 /*yield*/, aws_helper_1.awsInstanceProfileCredentials.getCredentials()];
                    case 5:
                        // expect to get same cred as it has not expire
                        _d.apply(void 0, [_e.sent()]).toBe(expectedCredentials[1]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('fails gracefully if there is no instance profile.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockFetch, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        mockFetch = function (url) {
                            if (url === 'http://169.254.169.254/latest/meta-data/iam/security-credentials/') {
                                return Promise.resolve({ text: function () { return Promise.resolve(''); } });
                            }
                            return Promise.reject('Unknown error');
                        };
                        mockedFetch.mockImplementation(mockFetch);
                        _a = expect;
                        return [4 /*yield*/, aws_helper_1.awsInstanceProfileCredentials.ok()];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBeFalsy();
                        expect(aws_helper_1.awsInstanceProfileCredentials.getCredentials).not.toThrow();
                        _b = expect;
                        return [4 /*yield*/, aws_helper_1.awsInstanceProfileCredentials.getCredentials()];
                    case 2:
                        _b.apply(void 0, [_c.sent()]).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('fails gracefully if there is no metadata store.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockFetch, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        mockFetch = function (_) {
                            return Promise.reject('Unknown error');
                        };
                        mockedFetch.mockImplementation(mockFetch);
                        _a = expect;
                        return [4 /*yield*/, aws_helper_1.awsInstanceProfileCredentials.ok()];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBeFalsy();
                        expect(aws_helper_1.awsInstanceProfileCredentials.getCredentials).not.toThrow();
                        _b = expect;
                        return [4 /*yield*/, aws_helper_1.awsInstanceProfileCredentials.getCredentials()];
                    case 2:
                        _b.apply(void 0, [_c.sent()]).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
describe('isS3Endpoint', function () {
    it('checks a valid s3 endpoint', function () {
        expect(aws_helper_1.isS3Endpoint('s3.amazonaws.com')).toBe(true);
    });
    it('checks a valid s3 regional endpoint', function () {
        expect(aws_helper_1.isS3Endpoint('s3.dualstack.us-east-1.amazonaws.com')).toBe(true);
    });
    it('checks a valid s3 cn endpoint', function () {
        expect(aws_helper_1.isS3Endpoint('s3.cn-north-1.amazonaws.com.cn')).toBe(true);
    });
    it('checks an invalid s3 endpoint', function () {
        expect(aws_helper_1.isS3Endpoint('amazonaws.com')).toBe(false);
    });
    it('checks non-s3 endpoint', function () {
        expect(aws_helper_1.isS3Endpoint('minio.kubeflow')).toBe(false);
    });
});
//# sourceMappingURL=aws-helper.test.js.map