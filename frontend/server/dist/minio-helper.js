"use strict";
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
var stream_1 = require("stream");
var tar = __importStar(require("tar-stream"));
var peek_stream_1 = __importDefault(require("peek-stream"));
var gunzip_maybe_1 = __importDefault(require("gunzip-maybe"));
var minio_1 = require("minio");
var aws_helper_1 = require("./aws-helper");
/**
 * Create minio client with aws instance profile credentials if needed.
 * @param config minio client options where `accessKey` and `secretKey` are optional.
 */
function createMinioClient(config) {
    return __awaiter(this, void 0, void 0, function () {
        var credentials, accessKey, secretKey, sessionToken, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(!config.accessKey || !config.secretKey)) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, aws_helper_1.awsInstanceProfileCredentials.ok()];
                case 2:
                    if (!_a.sent()) return [3 /*break*/, 4];
                    return [4 /*yield*/, aws_helper_1.awsInstanceProfileCredentials.getCredentials()];
                case 3:
                    credentials = _a.sent();
                    if (credentials) {
                        accessKey = credentials.AccessKeyId, secretKey = credentials.SecretAccessKey, sessionToken = credentials.Token;
                        return [2 /*return*/, new minio_1.Client(__assign(__assign({}, config), { accessKey: accessKey, secretKey: secretKey, sessionToken: sessionToken }))];
                    }
                    console.error('unable to get credentials from AWS metadata store.');
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    console.error('Unable to get aws instance profile credentials: ', err_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, new minio_1.Client(config)];
            }
        });
    });
}
exports.createMinioClient = createMinioClient;
/**
 * Checks the magic number of a buffer to see if the mime type is a uncompressed
 * tarball. The buffer must be of length 264 bytes or more.
 *
 * See also: https://www.gnu.org/software/tar/manual/html_node/Standard.html
 *
 * @param buf Buffer
 */
function isTarball(buf) {
    if (!buf || buf.length < 264) {
        return false;
    }
    var offset = 257;
    var v1 = [0x75, 0x73, 0x74, 0x61, 0x72, 0x00, 0x30, 0x30];
    var v0 = [0x75, 0x73, 0x74, 0x61, 0x72, 0x20, 0x20, 0x00];
    return (v1.reduce(function (res, curr, i) { return res && curr === buf[offset + i]; }, true) ||
        v0.reduce(function (res, curr, i) { return res && curr === buf[offset + i]; }, true));
}
exports.isTarball = isTarball;
/**
 * Returns a stream that extracts the first record of a tarball if the source
 * stream is a tarball, otherwise just pipe the content as is.
 */
function maybeTarball() {
    return peek_stream_1.default({ newline: false, maxBuffer: 264 }, function (data, swap) {
        if (isTarball(data))
            swap(undefined, extractFirstTarRecordAsStream());
        else
            swap(undefined, new stream_1.PassThrough());
    });
}
exports.maybeTarball = maybeTarball;
/**
 * Returns a transform stream where the first record inside a tarball will be
 * pushed - i.e. all other contents will be dropped.
 */
function extractFirstTarRecordAsStream() {
    var extract = tar.extract();
    var transformStream = new stream_1.Transform({
        write: function (chunk, encoding, callback) {
            extract.write(chunk, encoding, callback);
        },
    });
    extract.once('entry', function (_header, stream, next) {
        stream.on('data', function (buffer) { return transformStream.push(buffer); });
        stream.on('end', function () {
            transformStream.emit('end');
            next();
        });
        stream.resume(); // just auto drain the stream
    });
    extract.on('error', function (error) { return transformStream.emit('error', error); });
    return transformStream;
}
/**
 * Returns a stream from an object in a s3 compatible object store (e.g. minio).
 * The actual content of the stream depends on the object.
 *
 * Any gzipped or deflated objects will be ungzipped or inflated. If the object
 * is a tarball, only the content of the first record in the tarball will be
 * returned. For any other objects, the raw content will be returned.
 *
 * @param param.bucket Bucket name to retrieve the object from.
 * @param param.key Key of the object to retrieve.
 * @param param.client Minio client.
 *
 */
function getObjectStream(_a) {
    var bucket = _a.bucket, key = _a.key, client = _a.client;
    return __awaiter(this, void 0, void 0, function () {
        var stream;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, client.getObject(bucket, key)];
                case 1:
                    stream = _b.sent();
                    return [2 /*return*/, stream.pipe(gunzip_maybe_1.default()).pipe(maybeTarball())];
            }
        });
    });
}
exports.getObjectStream = getObjectStream;
//# sourceMappingURL=minio-helper.js.map