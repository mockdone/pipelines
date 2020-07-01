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
var zlib = __importStar(require("zlib"));
var stream_1 = require("stream");
var minio_1 = require("minio");
var aws_helper_1 = require("./aws-helper");
var minio_helper_1 = require("./minio-helper");
jest.mock('minio');
jest.mock('./aws-helper');
describe('minio-helper', function () {
    var MockedMinioClient = minio_1.Client;
    beforeEach(function () {
        jest.resetAllMocks();
    });
    describe('createMinioClient', function () {
        it('creates a minio client with the provided configs.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, minio_helper_1.createMinioClient({
                            accessKey: 'accesskey',
                            endPoint: 'minio.kubeflow:80',
                            secretKey: 'secretkey',
                        })];
                    case 1:
                        client = _a.sent();
                        expect(client).toBeInstanceOf(minio_1.Client);
                        expect(MockedMinioClient).toHaveBeenCalledWith({
                            accessKey: 'accesskey',
                            endPoint: 'minio.kubeflow:80',
                            secretKey: 'secretkey',
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('fallbacks to the provided configs if EC2 metadata is not available.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, minio_helper_1.createMinioClient({
                            endPoint: 'minio.kubeflow:80',
                        })];
                    case 1:
                        client = _a.sent();
                        expect(client).toBeInstanceOf(minio_1.Client);
                        expect(MockedMinioClient).toHaveBeenCalledWith({
                            endPoint: 'minio.kubeflow:80',
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('uses EC2 metadata credentials if access key are not provided.', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        aws_helper_1.awsInstanceProfileCredentials.getCredentials.mockImplementation(function () {
                            return Promise.resolve({
                                AccessKeyId: 'AccessKeyId',
                                Code: 'Success',
                                Expiration: new Date(Date.now() + 1000).toISOString(),
                                LastUpdated: '2019-12-17T10:55:38Z',
                                SecretAccessKey: 'SecretAccessKey',
                                Token: 'SessionToken',
                                Type: 'AWS-HMAC',
                            });
                        });
                        aws_helper_1.awsInstanceProfileCredentials.ok.mockImplementation(function () {
                            return Promise.resolve(true);
                        });
                        return [4 /*yield*/, minio_helper_1.createMinioClient({ endPoint: 's3.awsamazon.com' })];
                    case 1:
                        client = _a.sent();
                        expect(client).toBeInstanceOf(minio_1.Client);
                        expect(MockedMinioClient).toHaveBeenCalledWith({
                            accessKey: 'AccessKeyId',
                            endPoint: 's3.awsamazon.com',
                            secretKey: 'SecretAccessKey',
                            sessionToken: 'SessionToken',
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('isTarball', function () {
        it('checks magic number in buffer is a tarball.', function () {
            var tarGzBase64 = 'H4sIAFa7DV4AA+3PSwrCMBRG4Y5dxV1BuSGPridgwcItkTZSl++johNBJ0WE803OIHfwZ87j0fq2nmuzGVVNIcitXYqPpntXLojzSb33MToVdTG5rhHdbtLLaa55uk5ZBrMhj23ty9u7T+/rT+TZP3HozYosZbL97tdbAAAAAAAAAAAAAAAAAADfuwAyiYcHACgAAA==';
            var tarGzBuffer = Buffer.from(tarGzBase64, 'base64');
            var tarBuffer = zlib.gunzipSync(tarGzBuffer);
            expect(minio_helper_1.isTarball(tarBuffer)).toBe(true);
        });
        it('checks magic number in buffer is not a tarball.', function () {
            expect(minio_helper_1.isTarball(Buffer.from('some-random-string-more-random-string-even-more-random-string-even-even-more-random'))).toBe(false);
        });
    });
    describe('maybeTarball', function () {
        // hello world
        var tarGzBase64 = 'H4sIAFa7DV4AA+3PSwrCMBRG4Y5dxV1BuSGPridgwcItkTZSl++johNBJ0WE803OIHfwZ87j0fq2nmuzGVVNIcitXYqPpntXLojzSb33MToVdTG5rhHdbtLLaa55uk5ZBrMhj23ty9u7T+/rT+TZP3HozYosZbL97tdbAAAAAAAAAAAAAAAAAADfuwAyiYcHACgAAA==';
        var tarGzBuffer = Buffer.from(tarGzBase64, 'base64');
        var tarBuffer = zlib.gunzipSync(tarGzBuffer);
        it('return the content for the 1st file inside a tarball', function (done) {
            var stream = new stream_1.PassThrough();
            var maybeTar = stream.pipe(minio_helper_1.maybeTarball());
            stream.end(tarBuffer);
            stream.on('end', function () {
                expect(maybeTar.read().toString()).toBe('hello world\n');
                done();
            });
        });
        it('return the content normal if is not a tarball', function (done) {
            var stream = new stream_1.PassThrough();
            var maybeTar = stream.pipe(minio_helper_1.maybeTarball());
            stream.end('hello world');
            stream.on('end', function () {
                expect(maybeTar.read().toString()).toBe('hello world');
                done();
            });
        });
    });
    describe('getObjectStream', function () {
        // hello world
        var tarGzBase64 = 'H4sIAFa7DV4AA+3PSwrCMBRG4Y5dxV1BuSGPridgwcItkTZSl++johNBJ0WE803OIHfwZ87j0fq2nmuzGVVNIcitXYqPpntXLojzSb33MToVdTG5rhHdbtLLaa55uk5ZBrMhj23ty9u7T+/rT+TZP3HozYosZbL97tdbAAAAAAAAAAAAAAAAAADfuwAyiYcHACgAAA==';
        var tarGzBuffer = Buffer.from(tarGzBase64, 'base64');
        var tarBuffer = zlib.gunzipSync(tarGzBuffer);
        var minioClient;
        var mockedMinioGetObject;
        beforeEach(function () {
            jest.clearAllMocks();
            minioClient = new minio_1.Client({
                endPoint: 's3.amazonaws.com',
                accessKey: '',
                secretKey: '',
            });
            mockedMinioGetObject = minioClient.getObject;
        });
        it('unpacks a gzipped tarball', function (done) { return __awaiter(void 0, void 0, void 0, function () {
            var objStream, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        objStream = new stream_1.PassThrough();
                        objStream.end(tarGzBuffer);
                        mockedMinioGetObject.mockResolvedValueOnce(Promise.resolve(objStream));
                        return [4 /*yield*/, minio_helper_1.getObjectStream({ bucket: 'bucket', key: 'key', client: minioClient })];
                    case 1:
                        stream = _a.sent();
                        expect(mockedMinioGetObject).toBeCalledWith('bucket', 'key');
                        stream.on('finish', function () {
                            expect(stream
                                .read()
                                .toString()
                                .trim()).toBe('hello world');
                            done();
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('unpacks a uncompressed tarball', function (done) { return __awaiter(void 0, void 0, void 0, function () {
            var objStream, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        objStream = new stream_1.PassThrough();
                        objStream.end(tarBuffer);
                        mockedMinioGetObject.mockResolvedValueOnce(Promise.resolve(objStream));
                        return [4 /*yield*/, minio_helper_1.getObjectStream({ bucket: 'bucket', key: 'key', client: minioClient })];
                    case 1:
                        stream = _a.sent();
                        expect(mockedMinioGetObject).toBeCalledWith('bucket', 'key');
                        stream.on('finish', function () {
                            expect(stream
                                .read()
                                .toString()
                                .trim()).toBe('hello world');
                            done();
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns the content as a stream', function (done) { return __awaiter(void 0, void 0, void 0, function () {
            var objStream, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        objStream = new stream_1.PassThrough();
                        objStream.end('hello world');
                        mockedMinioGetObject.mockResolvedValueOnce(Promise.resolve(objStream));
                        return [4 /*yield*/, minio_helper_1.getObjectStream({ bucket: 'bucket', key: 'key', client: minioClient })];
                    case 1:
                        stream = _a.sent();
                        expect(mockedMinioGetObject).toBeCalledWith('bucket', 'key');
                        stream.on('finish', function () {
                            expect(stream
                                .read()
                                .toString()
                                .trim()).toBe('hello world');
                            done();
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=minio-helper.test.js.map