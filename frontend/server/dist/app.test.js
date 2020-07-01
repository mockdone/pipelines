"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
var stream_1 = require("stream");
var express_1 = __importDefault(require("express"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var supertest_1 = __importDefault(require("supertest"));
var minio_1 = require("minio");
var storage_1 = require("@google-cloud/storage");
var app_1 = require("./app");
var configs_1 = require("./configs");
var minioHelper = __importStar(require("./minio-helper"));
var k8s_helper_1 = require("./k8s-helper");
var test_helper_1 = require("./integration-tests/test-helper");
jest.mock('minio');
jest.mock('node-fetch');
jest.mock('@google-cloud/storage');
jest.mock('./minio-helper');
// TODO: move sections of tests here to individual files in `frontend/server/integration-tests/`
// for better organization and shorter/more focused tests.
var mockedFetch = node_fetch_1.default;
describe('UIServer apis', function () {
    var app;
    var tagName = '1.0.0';
    var commitHash = 'abcdefg';
    var _a = test_helper_1.commonSetup({ tagName: tagName, commitHash: commitHash }), argv = _a.argv, buildDate = _a.buildDate, indexHtmlContent = _a.indexHtmlContent;
    beforeEach(function () {
        var consoleInfoSpy = jest.spyOn(global.console, 'info');
        consoleInfoSpy.mockImplementation(function () { return null; });
        var consoleLogSpy = jest.spyOn(global.console, 'log');
        consoleLogSpy.mockImplementation(function () { return null; });
    });
    afterEach(function () {
        if (app) {
            app.close();
        }
    });
    describe('/', function () {
        it('responds with unmodified index.html if it is not a kubeflow deployment', function (done) {
            var configs = configs_1.loadConfigs(argv, {});
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/')
                .expect('Content-Type', 'text/html; charset=utf-8')
                .expect(200, indexHtmlContent, done);
        });
        it('responds with a modified index.html if it is a kubeflow deployment', function (done) {
            var expectedIndexHtml = "\n<html>\n<head>\n  <script>\n  window.KFP_FLAGS.DEPLOYMENT=\"KUBEFLOW\"\n  </script>\n  <script id=\"kubeflow-client-placeholder\" src=\"/dashboard_lib.bundle.js\"></script>\n</head>\n</html>";
            var configs = configs_1.loadConfigs(argv, { DEPLOYMENT: 'kubeflow' });
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/')
                .expect('Content-Type', 'text/html; charset=utf-8')
                .expect(200, expectedIndexHtml, done);
        });
        it('responds with flag DEPLOYMENT=MARKETPLACE if it is a marketplace deployment', function (done) {
            var expectedIndexHtml = "\n<html>\n<head>\n  <script>\n  window.KFP_FLAGS.DEPLOYMENT=\"MARKETPLACE\"\n  </script>\n  <script id=\"kubeflow-client-placeholder\"></script>\n</head>\n</html>";
            var configs = configs_1.loadConfigs(argv, { DEPLOYMENT: 'marketplace' });
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/')
                .expect('Content-Type', 'text/html; charset=utf-8')
                .expect(200, expectedIndexHtml, done);
        });
    });
    describe('/apis/v1beta1/healthz', function () {
        it('responds with apiServerReady to be false if ml-pipeline api server is not ready.', function (done) {
            node_fetch_1.default.mockImplementationOnce(function (_url, _opt) { return ({
                json: function () { return Promise.reject('Unknown error'); },
            }); });
            var configs = configs_1.loadConfigs(argv, {});
            app = new app_1.UIServer(configs);
            supertest_1.default(app.start())
                .get('/apis/v1beta1/healthz')
                .expect(200, {
                apiServerReady: false,
                buildDate: buildDate,
                frontendCommitHash: commitHash,
                frontendTagName: tagName,
            }, done);
        });
        it('responds with both ui server and ml-pipeline api state if ml-pipeline api server is also ready.', function (done) {
            node_fetch_1.default.mockImplementationOnce(function (_url, _opt) { return ({
                json: function () {
                    return Promise.resolve({
                        commit_sha: 'commit_sha',
                        tag_name: '1.0.0',
                    });
                },
            }); });
            var configs = configs_1.loadConfigs(argv, {});
            app = new app_1.UIServer(configs);
            supertest_1.default(app.start())
                .get('/apis/v1beta1/healthz')
                .expect(200, {
                apiServerCommitHash: 'commit_sha',
                apiServerTagName: '1.0.0',
                apiServerReady: true,
                buildDate: buildDate,
                frontendCommitHash: commitHash,
                frontendTagName: tagName,
            }, done);
        });
    });
    describe('/artifacts/get', function () {
        it('responds with a minio artifact if source=minio', function (done) {
            var artifactContent = 'hello world';
            var mockedMinioClient = minio_1.Client;
            var mockedGetObjectStream = minioHelper.getObjectStream;
            var objStream = new stream_1.PassThrough();
            objStream.end(artifactContent);
            mockedGetObjectStream.mockImplementationOnce(function (opt) {
                return opt.bucket === 'ml-pipeline' && opt.key === 'hello/world.txt'
                    ? Promise.resolve(objStream)
                    : Promise.reject('Unable to retrieve minio artifact.');
            });
            var configs = configs_1.loadConfigs(argv, {
                MINIO_ACCESS_KEY: 'minio',
                MINIO_HOST: 'minio-service',
                MINIO_NAMESPACE: 'kubeflow',
                MINIO_PORT: '9000',
                MINIO_SECRET_KEY: 'minio123',
                MINIO_SSL: 'false',
            });
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/artifacts/get?source=minio&bucket=ml-pipeline&key=hello%2Fworld.txt')
                .expect(200, artifactContent, function (err) {
                expect(mockedMinioClient).toBeCalledWith({
                    accessKey: 'minio',
                    endPoint: 'minio-service.kubeflow',
                    port: 9000,
                    secretKey: 'minio123',
                    useSSL: false,
                });
                done(err);
            });
        });
        it('responds with a s3 artifact if source=s3', function (done) {
            var artifactContent = 'hello world';
            var mockedMinioClient = minioHelper.createMinioClient;
            var mockedGetObjectStream = minioHelper.getObjectStream;
            var stream = new stream_1.PassThrough();
            stream.write(artifactContent);
            stream.end();
            mockedGetObjectStream.mockImplementationOnce(function (opt) {
                return opt.bucket === 'ml-pipeline' && opt.key === 'hello/world.txt'
                    ? Promise.resolve(stream)
                    : Promise.reject('Unable to retrieve s3 artifact.');
            });
            var configs = configs_1.loadConfigs(argv, {
                AWS_ACCESS_KEY_ID: 'aws123',
                AWS_SECRET_ACCESS_KEY: 'awsSecret123',
            });
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/artifacts/get?source=s3&bucket=ml-pipeline&key=hello%2Fworld.txt')
                .expect(200, artifactContent, function (err) {
                expect(mockedMinioClient).toBeCalledWith({
                    accessKey: 'aws123',
                    endPoint: 's3.amazonaws.com',
                    secretKey: 'awsSecret123',
                });
                done(err);
            });
        });
        it('responds with partial s3 artifact if peek=5 flag is set', function (done) {
            var artifactContent = 'hello world';
            var mockedMinioClient = minioHelper.createMinioClient;
            var mockedGetObjectStream = minioHelper.getObjectStream;
            var stream = new stream_1.PassThrough();
            stream.write(artifactContent);
            stream.end();
            mockedGetObjectStream.mockImplementationOnce(function (opt) {
                return opt.bucket === 'ml-pipeline' && opt.key === 'hello/world.txt'
                    ? Promise.resolve(stream)
                    : Promise.reject('Unable to retrieve s3 artifact.');
            });
            var configs = configs_1.loadConfigs(argv, {
                AWS_ACCESS_KEY_ID: 'aws123',
                AWS_SECRET_ACCESS_KEY: 'awsSecret123',
            });
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/artifacts/get?source=s3&bucket=ml-pipeline&key=hello%2Fworld.txt&peek=5')
                .expect(200, artifactContent.slice(0, 5), function (err) {
                expect(mockedMinioClient).toBeCalledWith({
                    accessKey: 'aws123',
                    endPoint: 's3.amazonaws.com',
                    secretKey: 'awsSecret123',
                });
                done(err);
            });
        });
        it('responds with a http artifact if source=http', function (done) {
            var artifactContent = 'hello world';
            mockedFetch.mockImplementationOnce(function (url, opts) {
                return url === 'http://foo.bar/ml-pipeline/hello/world.txt'
                    ? Promise.resolve({
                        buffer: function () { return Promise.resolve(artifactContent); },
                        body: new stream_1.PassThrough().end(artifactContent),
                    })
                    : Promise.reject('Unable to retrieve http artifact.');
            });
            var configs = configs_1.loadConfigs(argv, {
                HTTP_BASE_URL: 'foo.bar/',
            });
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/artifacts/get?source=http&bucket=ml-pipeline&key=hello%2Fworld.txt')
                .expect(200, artifactContent, function (err) {
                expect(mockedFetch).toBeCalledWith('http://foo.bar/ml-pipeline/hello/world.txt', {
                    headers: {},
                });
                done(err);
            });
        });
        it('responds with partial http artifact if peek=5 flag is set', function (done) {
            var artifactContent = 'hello world';
            var mockedFetch = node_fetch_1.default;
            mockedFetch.mockImplementationOnce(function (url, opts) {
                return url === 'http://foo.bar/ml-pipeline/hello/world.txt'
                    ? Promise.resolve({
                        buffer: function () { return Promise.resolve(artifactContent); },
                        body: new stream_1.PassThrough().end(artifactContent),
                    })
                    : Promise.reject('Unable to retrieve http artifact.');
            });
            var configs = configs_1.loadConfigs(argv, {
                HTTP_BASE_URL: 'foo.bar/',
            });
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/artifacts/get?source=http&bucket=ml-pipeline&key=hello%2Fworld.txt&peek=5')
                .expect(200, artifactContent.slice(0, 5), function (err) {
                expect(mockedFetch).toBeCalledWith('http://foo.bar/ml-pipeline/hello/world.txt', {
                    headers: {},
                });
                done(err);
            });
        });
        it('responds with a https artifact if source=https', function (done) {
            var artifactContent = 'hello world';
            mockedFetch.mockImplementationOnce(function (url, opts) {
                return url === 'https://foo.bar/ml-pipeline/hello/world.txt' &&
                    opts.headers.Authorization === 'someToken'
                    ? Promise.resolve({
                        buffer: function () { return Promise.resolve(artifactContent); },
                        body: new stream_1.PassThrough().end(artifactContent),
                    })
                    : Promise.reject('Unable to retrieve http artifact.');
            });
            var configs = configs_1.loadConfigs(argv, {
                HTTP_AUTHORIZATION_DEFAULT_VALUE: 'someToken',
                HTTP_AUTHORIZATION_KEY: 'Authorization',
                HTTP_BASE_URL: 'foo.bar/',
            });
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/artifacts/get?source=https&bucket=ml-pipeline&key=hello%2Fworld.txt')
                .expect(200, artifactContent, function (err) {
                expect(mockedFetch).toBeCalledWith('https://foo.bar/ml-pipeline/hello/world.txt', {
                    headers: {
                        Authorization: 'someToken',
                    },
                });
                done(err);
            });
        });
        it('responds with a https artifact using the inherited header if source=https and http authorization key is provided.', function (done) {
            var artifactContent = 'hello world';
            mockedFetch.mockImplementationOnce(function (url, _opts) {
                return url === 'https://foo.bar/ml-pipeline/hello/world.txt'
                    ? Promise.resolve({
                        buffer: function () { return Promise.resolve(artifactContent); },
                        body: new stream_1.PassThrough().end(artifactContent),
                    })
                    : Promise.reject('Unable to retrieve http artifact.');
            });
            var configs = configs_1.loadConfigs(argv, {
                HTTP_AUTHORIZATION_KEY: 'Authorization',
                HTTP_BASE_URL: 'foo.bar/',
            });
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/artifacts/get?source=https&bucket=ml-pipeline&key=hello%2Fworld.txt')
                .set('Authorization', 'inheritedToken')
                .expect(200, artifactContent, function (err) {
                expect(mockedFetch).toBeCalledWith('https://foo.bar/ml-pipeline/hello/world.txt', {
                    headers: {
                        Authorization: 'inheritedToken',
                    },
                });
                done(err);
            });
        });
        it('responds with a gcs artifact if source=gcs', function (done) {
            var artifactContent = 'hello world';
            var mockedGcsStorage = storage_1.Storage;
            var stream = new stream_1.PassThrough();
            stream.write(artifactContent);
            stream.end();
            mockedGcsStorage.mockImplementationOnce(function () { return ({
                bucket: function () { return ({
                    getFiles: function () {
                        return Promise.resolve([[{ name: 'hello/world.txt', createReadStream: function () { return stream; } }]]);
                    },
                }); },
            }); });
            var configs = configs_1.loadConfigs(argv, {});
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/artifacts/get?source=gcs&bucket=ml-pipeline&key=hello%2Fworld.txt')
                .expect(200, artifactContent + '\n', done);
        });
        it('responds with a partial gcs artifact if peek=5 is set', function (done) {
            var artifactContent = 'hello world';
            var mockedGcsStorage = storage_1.Storage;
            var stream = new stream_1.PassThrough();
            stream.end(artifactContent);
            mockedGcsStorage.mockImplementationOnce(function () { return ({
                bucket: function () { return ({
                    getFiles: function () {
                        return Promise.resolve([[{ name: 'hello/world.txt', createReadStream: function () { return stream; } }]]);
                    },
                }); },
            }); });
            var configs = configs_1.loadConfigs(argv, {});
            app = new app_1.UIServer(configs);
            var request = supertest_1.default(app.start());
            request
                .get('/artifacts/get?source=gcs&bucket=ml-pipeline&key=hello%2Fworld.txt&peek=5')
                .expect(200, artifactContent.slice(0, 5), done);
        });
    });
    describe('/system', function () {
        describe('/cluster-name', function () {
            it('responds with cluster name data from gke metadata', function (done) {
                mockedFetch.mockImplementationOnce(function (url, _opts) {
                    return url === 'http://metadata/computeMetadata/v1/instance/attributes/cluster-name'
                        ? Promise.resolve({ ok: true, text: function () { return Promise.resolve('test-cluster'); } })
                        : Promise.reject('Unexpected request');
                });
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                var request = supertest_1.default(app.start());
                request
                    .get('/system/cluster-name')
                    .expect('Content-Type', 'text/html; charset=utf-8')
                    .expect(200, 'test-cluster', done);
            });
            it('responds with 500 status code if corresponding endpoint is not ok', function (done) {
                mockedFetch.mockImplementationOnce(function (url, _opts) {
                    return url === 'http://metadata/computeMetadata/v1/instance/attributes/cluster-name'
                        ? Promise.resolve({ ok: false, text: function () { return Promise.resolve('404 not found'); } })
                        : Promise.reject('Unexpected request');
                });
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                var request = supertest_1.default(app.start());
                request.get('/system/cluster-name').expect(500, 'Failed fetching GKE cluster name', done);
            });
            it('responds with endpoint disabled if DISABLE_GKE_METADATA env is true', function (done) {
                var configs = configs_1.loadConfigs(argv, { DISABLE_GKE_METADATA: 'true' });
                app = new app_1.UIServer(configs);
                var request = supertest_1.default(app.start());
                request
                    .get('/system/cluster-name')
                    .expect(500, 'GKE metadata endpoints are disabled.', done);
            });
        });
        describe('/project-id', function () {
            it('responds with project id data from gke metadata', function (done) {
                mockedFetch.mockImplementationOnce(function (url, _opts) {
                    return url === 'http://metadata/computeMetadata/v1/project/project-id'
                        ? Promise.resolve({ ok: true, text: function () { return Promise.resolve('test-project'); } })
                        : Promise.reject('Unexpected request');
                });
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                var request = supertest_1.default(app.start());
                request.get('/system/project-id').expect(200, 'test-project', done);
            });
            it('responds with 500 status code if metadata request is not ok', function (done) {
                mockedFetch.mockImplementationOnce(function (url, _opts) {
                    return url === 'http://metadata/computeMetadata/v1/project/project-id'
                        ? Promise.resolve({ ok: false, text: function () { return Promise.resolve('404 not found'); } })
                        : Promise.reject('Unexpected request');
                });
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                var request = supertest_1.default(app.start());
                request.get('/system/project-id').expect(500, 'Failed fetching GKE project id', done);
            });
            it('responds with endpoint disabled if DISABLE_GKE_METADATA env is true', function (done) {
                app = new app_1.UIServer(configs_1.loadConfigs(argv, { DISABLE_GKE_METADATA: 'true' }));
                var request = supertest_1.default(app.start());
                request.get('/system/project-id').expect(500, 'GKE metadata endpoints are disabled.', done);
            });
        });
    });
    describe('/k8s/pod', function () {
        var request;
        beforeEach(function () {
            app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
            request = supertest_1.default(app.start());
        });
        it('asks for podname if not provided', function (done) {
            request.get('/k8s/pod').expect(422, 'podname argument is required', done);
        });
        it('asks for podnamespace if not provided', function (done) {
            request
                .get('/k8s/pod?podname=test-pod')
                .expect(422, 'podnamespace argument is required', done);
        });
        it('responds with pod info in JSON', function (done) {
            var readPodSpy = jest.spyOn(k8s_helper_1.TEST_ONLY.k8sV1Client, 'readNamespacedPod');
            readPodSpy.mockImplementation(function () {
                return Promise.resolve({
                    body: { kind: 'Pod' },
                });
            });
            request
                .get('/k8s/pod?podname=test-pod&podnamespace=test-ns')
                .expect(200, '{"kind":"Pod"}', function (err) {
                expect(readPodSpy).toHaveBeenCalledWith('test-pod', 'test-ns');
                done(err);
            });
        });
        it('responds with error when failed to retrieve pod info', function (done) {
            var readPodSpy = jest.spyOn(k8s_helper_1.TEST_ONLY.k8sV1Client, 'readNamespacedPod');
            readPodSpy.mockImplementation(function () {
                return Promise.reject({
                    body: {
                        message: 'pod not found',
                        code: 404,
                    },
                });
            });
            var spyError = jest.spyOn(console, 'error').mockImplementation(function () { return null; });
            request
                .get('/k8s/pod?podname=test-pod&podnamespace=test-ns')
                .expect(500, 'Could not get pod test-pod in namespace test-ns: pod not found', function () {
                expect(spyError).toHaveBeenCalledTimes(1);
                done();
            });
        });
    });
    describe('/k8s/pod/events', function () {
        var request;
        beforeEach(function () {
            app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
            request = supertest_1.default(app.start());
        });
        it('asks for podname if not provided', function (done) {
            request.get('/k8s/pod/events').expect(422, 'podname argument is required', done);
        });
        it('asks for podnamespace if not provided', function (done) {
            request
                .get('/k8s/pod/events?podname=test-pod')
                .expect(422, 'podnamespace argument is required', done);
        });
        it('responds with pod info in JSON', function (done) {
            var listEventSpy = jest.spyOn(k8s_helper_1.TEST_ONLY.k8sV1Client, 'listNamespacedEvent');
            listEventSpy.mockImplementation(function () {
                return Promise.resolve({
                    body: { kind: 'EventList' },
                });
            });
            request
                .get('/k8s/pod/events?podname=test-pod&podnamespace=test-ns')
                .expect(200, '{"kind":"EventList"}', function (err) {
                expect(listEventSpy).toHaveBeenCalledWith('test-ns', undefined, undefined, undefined, 'involvedObject.namespace=test-ns,involvedObject.name=test-pod,involvedObject.kind=Pod');
                done(err);
            });
        });
        it('responds with error when failed to retrieve pod info', function (done) {
            var listEventSpy = jest.spyOn(k8s_helper_1.TEST_ONLY.k8sV1Client, 'listNamespacedEvent');
            listEventSpy.mockImplementation(function () {
                return Promise.reject({
                    body: {
                        message: 'no events',
                        code: 404,
                    },
                });
            });
            var spyError = jest.spyOn(console, 'error').mockImplementation(function () { return null; });
            request
                .get('/k8s/pod/events?podname=test-pod&podnamespace=test-ns')
                .expect(500, 'Error when listing pod events for pod "test-pod" in "test-ns" namespace: no events', function (err) {
                expect(spyError).toHaveBeenCalledTimes(1);
                done(err);
            });
        });
    });
    describe('/apps/tensorboard', function () {
        var k8sGetCustomObjectSpy;
        var k8sDeleteCustomObjectSpy;
        var k8sCreateCustomObjectSpy;
        var kfpApiServer;
        function newGetTensorboardResponse(_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.name, name = _c === void 0 ? 'viewer-example' : _c, _d = _b.logDir, logDir = _d === void 0 ? 'log-dir-example' : _d, _e = _b.tensorflowImage, tensorflowImage = _e === void 0 ? 'tensorflow:2.0.0' : _e, _f = _b.type, type = _f === void 0 ? 'tensorboard' : _f;
            return {
                response: undefined,
                body: {
                    metadata: {
                        name: name,
                    },
                    spec: {
                        tensorboardSpec: { logDir: logDir, tensorflowImage: tensorflowImage },
                        type: type,
                    },
                },
            };
        }
        beforeEach(function () {
            k8sGetCustomObjectSpy = jest.spyOn(k8s_helper_1.TEST_ONLY.k8sV1CustomObjectClient, 'getNamespacedCustomObject');
            k8sDeleteCustomObjectSpy = jest.spyOn(k8s_helper_1.TEST_ONLY.k8sV1CustomObjectClient, 'deleteNamespacedCustomObject');
            k8sCreateCustomObjectSpy = jest.spyOn(k8s_helper_1.TEST_ONLY.k8sV1CustomObjectClient, 'createNamespacedCustomObject');
        });
        afterEach(function () {
            if (kfpApiServer) {
                kfpApiServer.close();
            }
        });
        describe('get', function () {
            it('requires logdir for get tensorboard', function (done) {
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                supertest_1.default(app.start())
                    .get('/apps/tensorboard')
                    .expect(400, 'logdir argument is required', done);
            });
            it('requires namespace for get tensorboard', function (done) {
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                supertest_1.default(app.start())
                    .get('/apps/tensorboard?logdir=some-log-dir')
                    .expect(400, 'namespace argument is required', done);
            });
            it('does not crash with a weird query', function (done) {
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                k8sGetCustomObjectSpy.mockImplementation(function () {
                    return Promise.resolve(newGetTensorboardResponse());
                });
                // The special case is that, decodeURIComponent('%2') throws an
                // exception, so this can verify handler doesn't do extra
                // decodeURIComponent on queries.
                var weirdLogDir = encodeURIComponent('%2');
                supertest_1.default(app.start())
                    .get("/apps/tensorboard?logdir=" + weirdLogDir + "&namespace=test-ns")
                    .expect(200, done);
            });
            function setupMockKfpApiService(_a) {
                var _b = (_a === void 0 ? {} : _a).port, port = _b === void 0 ? 3001 : _b;
                var receivedHeaders = [];
                kfpApiServer = express_1.default()
                    .get('/apis/v1beta1/auth', function (req, res) {
                    receivedHeaders.push(req.headers);
                    res.status(200).send('{}'); // Authorized
                })
                    .listen(port);
                return { receivedHeaders: receivedHeaders, host: 'localhost', port: port };
            }
            it('authorizes user requests from KFP auth api', function (done) {
                var _a = setupMockKfpApiService(), receivedHeaders = _a.receivedHeaders, host = _a.host, port = _a.port;
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {
                    ENABLE_AUTHZ: 'true',
                    ML_PIPELINE_SERVICE_PORT: "" + port,
                    ML_PIPELINE_SERVICE_HOST: host,
                }));
                k8sGetCustomObjectSpy.mockImplementation(function () {
                    return Promise.resolve(newGetTensorboardResponse());
                });
                supertest_1.default(app.start())
                    .get("/apps/tensorboard?logdir=some-log-dir&namespace=test-ns")
                    .set('x-goog-authenticated-user-email', 'accounts.google.com:user@google.com')
                    .expect(200, function (err) {
                    expect(receivedHeaders).toHaveLength(1);
                    expect(receivedHeaders[0]).toMatchInlineSnapshot("\n              Object {\n                \"accept\": \"*/*\",\n                \"accept-encoding\": \"gzip,deflate\",\n                \"connection\": \"close\",\n                \"host\": \"localhost:3001\",\n                \"user-agent\": \"node-fetch/1.0 (+https://github.com/bitinn/node-fetch)\",\n                \"x-goog-authenticated-user-email\": \"accounts.google.com:user@google.com\",\n              }\n            ");
                    done(err);
                });
            });
            it('uses configured KUBEFLOW_USERID_HEADER for user identity', function (done) {
                var _a = setupMockKfpApiService(), receivedHeaders = _a.receivedHeaders, host = _a.host, port = _a.port;
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {
                    ENABLE_AUTHZ: 'true',
                    KUBEFLOW_USERID_HEADER: 'x-kubeflow-userid',
                    ML_PIPELINE_SERVICE_PORT: "" + port,
                    ML_PIPELINE_SERVICE_HOST: host,
                }));
                k8sGetCustomObjectSpy.mockImplementation(function () {
                    return Promise.resolve(newGetTensorboardResponse());
                });
                supertest_1.default(app.start())
                    .get("/apps/tensorboard?logdir=some-log-dir&namespace=test-ns")
                    .set('x-kubeflow-userid', 'user@kubeflow.org')
                    .expect(200, function (err) {
                    expect(receivedHeaders).toHaveLength(1);
                    expect(receivedHeaders[0]).toHaveProperty('x-kubeflow-userid', 'user@kubeflow.org');
                    done(err);
                });
            });
            it('rejects user requests when KFP auth api rejected', function (done) {
                var errorSpy = jest.spyOn(console, 'error');
                errorSpy.mockImplementation();
                var apiServerPort = 3001;
                kfpApiServer = express_1.default()
                    .get('/apis/v1beta1/auth', function (_, res) {
                    res.status(400).send(JSON.stringify({
                        error: 'User xxx is not unauthorized to list viewers',
                        details: ['unauthorized', 'callstack'],
                    }));
                })
                    .listen(apiServerPort);
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {
                    ENABLE_AUTHZ: 'true',
                    ML_PIPELINE_SERVICE_PORT: "" + apiServerPort,
                    ML_PIPELINE_SERVICE_HOST: 'localhost',
                }));
                k8sGetCustomObjectSpy.mockImplementation(function () {
                    return Promise.resolve(newGetTensorboardResponse());
                });
                supertest_1.default(app.start())
                    .get("/apps/tensorboard?logdir=some-log-dir&namespace=test-ns")
                    .expect(401, 'User is not authorized to GET VIEWERS in namespace test-ns: User xxx is not unauthorized to list viewers', function (err) {
                    expect(errorSpy).toHaveBeenCalledTimes(1);
                    expect(errorSpy).toHaveBeenCalledWith('User is not authorized to GET VIEWERS in namespace test-ns: User xxx is not unauthorized to list viewers', ['unauthorized', 'callstack']);
                    done(err);
                });
            });
            it('gets tensorboard url and version', function (done) {
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                k8sGetCustomObjectSpy.mockImplementation(function () {
                    return Promise.resolve(newGetTensorboardResponse({
                        name: 'viewer-abcdefg',
                        logDir: 'log-dir-1',
                        tensorflowImage: 'tensorflow:2.0.0',
                    }));
                });
                supertest_1.default(app.start())
                    .get("/apps/tensorboard?logdir=" + encodeURIComponent('log-dir-1') + "&namespace=test-ns")
                    .expect(200, JSON.stringify({
                    podAddress: 'http://viewer-abcdefg-service.test-ns.svc.cluster.local:80/tensorboard/viewer-abcdefg/',
                    tfVersion: '2.0.0',
                }), function (err) {
                    expect(k8sGetCustomObjectSpy.mock.calls[0]).toMatchInlineSnapshot("\n                              Array [\n                                \"kubeflow.org\",\n                                \"v1beta1\",\n                                \"test-ns\",\n                                \"viewers\",\n                                \"viewer-5e1404e679e27b0f0b8ecee8fe515830eaa736c5\",\n                              ]\n                          ");
                    done(err);
                });
            });
        });
        describe('post (create)', function () {
            it('requires logdir', function (done) {
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                supertest_1.default(app.start())
                    .post('/apps/tensorboard')
                    .expect(400, 'logdir argument is required', done);
            });
            it('requires namespace', function (done) {
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                supertest_1.default(app.start())
                    .post('/apps/tensorboard?logdir=some-log-dir')
                    .expect(400, 'namespace argument is required', done);
            });
            it('requires tfversion', function (done) {
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                supertest_1.default(app.start())
                    .post('/apps/tensorboard?logdir=some-log-dir&namespace=test-ns')
                    .expect(400, 'tfversion (tensorflow version) argument is required', done);
            });
            it('creates tensorboard viewer custom object and waits for it', function (done) {
                var getRequestCount = 0;
                k8sGetCustomObjectSpy.mockImplementation(function () {
                    ++getRequestCount;
                    switch (getRequestCount) {
                        case 1:
                            return Promise.reject('Not found');
                        case 2:
                            return Promise.resolve(newGetTensorboardResponse({
                                name: 'viewer-abcdefg',
                                logDir: 'log-dir-1',
                                tensorflowImage: 'tensorflow:2.0.0',
                            }));
                        default:
                            throw new Error('only expected to be called twice in this test');
                    }
                });
                k8sCreateCustomObjectSpy.mockImplementation(function () { return Promise.resolve(); });
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                supertest_1.default(app.start())
                    .post("/apps/tensorboard?logdir=" + encodeURIComponent('log-dir-1') + "&namespace=test-ns&tfversion=2.0.0")
                    .expect(200, 'http://viewer-abcdefg-service.test-ns.svc.cluster.local:80/tensorboard/viewer-abcdefg/', function (err) {
                    expect(k8sGetCustomObjectSpy.mock.calls[0]).toMatchInlineSnapshot("\n                Array [\n                  \"kubeflow.org\",\n                  \"v1beta1\",\n                  \"test-ns\",\n                  \"viewers\",\n                  \"viewer-5e1404e679e27b0f0b8ecee8fe515830eaa736c5\",\n                ]\n              ");
                    expect(k8sCreateCustomObjectSpy.mock.calls[0]).toMatchInlineSnapshot("\n                Array [\n                  \"kubeflow.org\",\n                  \"v1beta1\",\n                  \"test-ns\",\n                  \"viewers\",\n                  Object {\n                    \"apiVersion\": \"kubeflow.org/v1beta1\",\n                    \"kind\": \"Viewer\",\n                    \"metadata\": Object {\n                      \"name\": \"viewer-5e1404e679e27b0f0b8ecee8fe515830eaa736c5\",\n                      \"namespace\": \"test-ns\",\n                    },\n                    \"spec\": Object {\n                      \"podTemplateSpec\": Object {\n                        \"spec\": Object {\n                          \"containers\": Array [\n                            Object {},\n                          ],\n                        },\n                      },\n                      \"tensorboardSpec\": Object {\n                        \"logDir\": \"log-dir-1\",\n                        \"tensorflowImage\": \"tensorflow/tensorflow:2.0.0\",\n                      },\n                      \"type\": \"tensorboard\",\n                    },\n                  },\n                ]\n              ");
                    expect(k8sGetCustomObjectSpy.mock.calls[1]).toMatchInlineSnapshot("\n                Array [\n                  \"kubeflow.org\",\n                  \"v1beta1\",\n                  \"test-ns\",\n                  \"viewers\",\n                  \"viewer-5e1404e679e27b0f0b8ecee8fe515830eaa736c5\",\n                ]\n              ");
                    done(err);
                });
            });
            it('returns error when there is an existing tensorboard with different version', function (done) {
                var errorSpy = jest.spyOn(console, 'error');
                errorSpy.mockImplementation();
                k8sGetCustomObjectSpy.mockImplementation(function () {
                    return Promise.resolve(newGetTensorboardResponse({
                        name: 'viewer-abcdefg',
                        logDir: 'log-dir-1',
                        tensorflowImage: 'tensorflow:2.1.0',
                    }));
                });
                k8sCreateCustomObjectSpy.mockImplementation(function () { return Promise.resolve(); });
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                supertest_1.default(app.start())
                    .post("/apps/tensorboard?logdir=" + encodeURIComponent('log-dir-1') + "&namespace=test-ns&tfversion=2.0.0")
                    .expect(500, "Failed to start Tensorboard app: There's already an existing tensorboard instance with a different version 2.1.0", function (err) {
                    expect(errorSpy).toHaveBeenCalledTimes(1);
                    done(err);
                });
            });
            it('returns existing pod address if there is an existing tensorboard with the same version', function (done) {
                k8sGetCustomObjectSpy.mockImplementation(function () {
                    return Promise.resolve(newGetTensorboardResponse({
                        name: 'viewer-abcdefg',
                        logDir: 'log-dir-1',
                        tensorflowImage: 'tensorflow:2.0.0',
                    }));
                });
                k8sCreateCustomObjectSpy.mockImplementation(function () { return Promise.resolve(); });
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                supertest_1.default(app.start())
                    .post("/apps/tensorboard?logdir=" + encodeURIComponent('log-dir-1') + "&namespace=test-ns&tfversion=2.0.0")
                    .expect(200, 'http://viewer-abcdefg-service.test-ns.svc.cluster.local:80/tensorboard/viewer-abcdefg/', done);
            });
        });
        describe('delete', function () {
            it('requires logdir', function (done) {
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                supertest_1.default(app.start())
                    .delete('/apps/tensorboard')
                    .expect(400, 'logdir argument is required', done);
            });
            it('requires namespace', function (done) {
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                supertest_1.default(app.start())
                    .delete('/apps/tensorboard?logdir=some-log-dir')
                    .expect(400, 'namespace argument is required', done);
            });
            it('deletes tensorboard viewer custom object', function (done) {
                k8sGetCustomObjectSpy.mockImplementation(function () {
                    return Promise.resolve(newGetTensorboardResponse({
                        name: 'viewer-abcdefg',
                        logDir: 'log-dir-1',
                        tensorflowImage: 'tensorflow:2.0.0',
                    }));
                });
                k8sDeleteCustomObjectSpy.mockImplementation(function () { return Promise.resolve(); });
                app = new app_1.UIServer(configs_1.loadConfigs(argv, {}));
                supertest_1.default(app.start())
                    .delete("/apps/tensorboard?logdir=" + encodeURIComponent('log-dir-1') + "&namespace=test-ns")
                    .expect(200, 'Tensorboard deleted.', function (err) {
                    expect(k8sDeleteCustomObjectSpy.mock.calls[0]).toMatchInlineSnapshot("\n              Array [\n                \"kubeflow.org\",\n                \"v1beta1\",\n                \"test-ns\",\n                \"viewers\",\n                \"viewer-5e1404e679e27b0f0b8ecee8fe515830eaa736c5\",\n                V1DeleteOptions {},\n              ]\n            ");
                    done(err);
                });
            });
        });
    });
    // TODO: Add integration tests for k8s helper related endpoints
    // describe('/k8s/pod/logs', () => {});
    describe('/apis/v1beta1/', function () {
        var request;
        var kfpApiServer;
        beforeEach(function () {
            var kfpApiPort = 3001;
            kfpApiServer = express_1.default()
                .all('/*', function (_, res) {
                res.status(200).send('KFP API is working');
            })
                .listen(kfpApiPort);
            app = new app_1.UIServer(configs_1.loadConfigs(argv, {
                ML_PIPELINE_SERVICE_PORT: "" + kfpApiPort,
                ML_PIPELINE_SERVICE_HOST: 'localhost',
            }));
            request = supertest_1.default(app.start());
        });
        afterEach(function () {
            if (kfpApiServer) {
                kfpApiServer.close();
            }
        });
        it('rejects reportMetrics because it is not public kfp api', function (done) {
            var runId = 'a-random-run-id';
            request
                .post("/apis/v1beta1/runs/" + runId + ":reportMetrics")
                .expect(403, '/apis/v1beta1/runs/a-random-run-id:reportMetrics endpoint is not meant for external usage.', done);
        });
        it('rejects reportWorkflow because it is not public kfp api', function (done) {
            var workflowId = 'a-random-workflow-id';
            request
                .post("/apis/v1beta1/workflows/" + workflowId)
                .expect(403, '/apis/v1beta1/workflows/a-random-workflow-id endpoint is not meant for external usage.', done);
        });
        it('rejects reportScheduledWorkflow because it is not public kfp api', function (done) {
            var swf = 'a-random-swf-id';
            request
                .post("/apis/v1beta1/scheduledworkflows/" + swf)
                .expect(403, '/apis/v1beta1/scheduledworkflows/a-random-swf-id endpoint is not meant for external usage.', done);
        });
        it('does not reject similar apis', function (done) {
            request // use reportMetrics as runId to see if it can confuse route parsing
                .post("/apis/v1beta1/runs/xxx-reportMetrics:archive")
                .expect(200, 'KFP API is working', done);
        });
        it('proxies other run apis', function (done) {
            request
                .post("/apis/v1beta1/runs/a-random-run-id:archive")
                .expect(200, 'KFP API is working', done);
        });
    });
});
//# sourceMappingURL=app.test.js.map