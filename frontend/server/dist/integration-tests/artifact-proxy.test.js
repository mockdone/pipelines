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
var app_1 = require("../app");
var test_helper_1 = require("./test-helper");
var supertest_1 = __importDefault(require("supertest"));
var configs_1 = require("../configs");
var minioHelper = __importStar(require("../minio-helper"));
var stream_1 = require("stream");
var express_1 = __importDefault(require("express"));
var artifactsHandler = __importStar(require("../handlers/artifacts"));
beforeEach(function () {
    jest.spyOn(global.console, 'info').mockImplementation();
    jest.spyOn(global.console, 'log').mockImplementation();
    jest.spyOn(global.console, 'debug').mockImplementation();
});
var commonParams = {
    source: 'minio',
    bucket: 'ml-pipeline',
    key: 'hello.txt',
};
describe('/artifacts/get namespaced proxy', function () {
    var app;
    var argv = test_helper_1.commonSetup().argv;
    afterEach(function () {
        if (app) {
            app.close();
        }
    });
    function setupMinioArtifactDeps(_a) {
        var content = _a.content;
        var getObjectStreamSpy = jest.spyOn(minioHelper, 'getObjectStream');
        var objStream = new stream_1.PassThrough();
        objStream.end(content);
        getObjectStreamSpy.mockImplementationOnce(function () { return Promise.resolve(objStream); });
    }
    var artifactServerInUserNamespace;
    function setUpNamespacedArtifactService(_a) {
        var _b = _a.namespace, namespace = _b === void 0 ? 'any-ns' : _b, _c = _a.port, port = _c === void 0 ? 3002 : _c;
        var receivedUrls = [];
        var artifactService = express_1.default();
        var response = "artifact service in " + namespace;
        artifactService.all('/*', function (req, res) {
            receivedUrls.push(req.url);
            res.status(200).send(response);
        });
        artifactServerInUserNamespace = artifactService.listen(port);
        var getArtifactServiceGetterSpy = jest
            .spyOn(artifactsHandler, 'getArtifactServiceGetter')
            .mockImplementation(function () { return function () { return "http://localhost:" + port; }; });
        return { receivedUrls: receivedUrls, getArtifactServiceGetterSpy: getArtifactServiceGetterSpy, response: response };
    }
    afterEach(function () {
        if (artifactServerInUserNamespace) {
            artifactServerInUserNamespace.close();
        }
    });
    it('is disabled by default', function (done) {
        setupMinioArtifactDeps({ content: 'text-data' });
        var configs = configs_1.loadConfigs(argv, {});
        app = new app_1.UIServer(configs);
        supertest_1.default(app.start())
            .get("/artifacts/get" + test_helper_1.buildQuery(__assign(__assign({}, commonParams), { namespace: 'ns2' })))
            .expect(200, 'text-data', done);
    });
    it('proxies a request to namespaced artifact service', function (done) {
        var _a = setUpNamespacedArtifactService({
            namespace: 'ns2',
        }), receivedUrls = _a.receivedUrls, getArtifactServiceGetterSpy = _a.getArtifactServiceGetterSpy;
        var configs = configs_1.loadConfigs(argv, {
            ARTIFACTS_SERVICE_PROXY_NAME: 'artifact-svc',
            ARTIFACTS_SERVICE_PROXY_PORT: '80',
            ARTIFACTS_SERVICE_PROXY_ENABLED: 'true',
        });
        app = new app_1.UIServer(configs);
        supertest_1.default(app.start())
            .get("/artifacts/get" + test_helper_1.buildQuery(__assign(__assign({}, commonParams), { namespace: 'ns2' })))
            .expect(200, 'artifact service in ns2', function (err) {
            expect(getArtifactServiceGetterSpy).toHaveBeenCalledWith({
                serviceName: 'artifact-svc',
                servicePort: 80,
                enabled: true,
            });
            expect(receivedUrls).toEqual(
            // url is the same, except namespace query is omitted
            ['/artifacts/get?source=minio&bucket=ml-pipeline&key=hello.txt']);
            done(err);
        });
    });
    it('does not proxy requests without namespace argument', function (done) {
        setupMinioArtifactDeps({ content: 'text-data2' });
        var configs = configs_1.loadConfigs(argv, { ARTIFACTS_SERVICE_PROXY_ENABLED: 'true' });
        app = new app_1.UIServer(configs);
        supertest_1.default(app.start())
            .get("/artifacts/get" + test_helper_1.buildQuery(__assign(__assign({}, commonParams), { namespace: undefined })))
            .expect(200, 'text-data2', done);
    });
    it('proxies a request with basePath too', function (done) {
        var _a = setUpNamespacedArtifactService({}), receivedUrls = _a.receivedUrls, response = _a.response;
        var configs = configs_1.loadConfigs(argv, {
            ARTIFACTS_SERVICE_PROXY_ENABLED: 'true',
        });
        app = new app_1.UIServer(configs);
        supertest_1.default(app.start())
            .get("/pipeline/artifacts/get" + test_helper_1.buildQuery(__assign(__assign({}, commonParams), { namespace: 'ns-any' })))
            .expect(200, response, function (err) {
            expect(receivedUrls).toEqual(
            // url is the same with base path, except namespace query is omitted
            ['/pipeline/artifacts/get?source=minio&bucket=ml-pipeline&key=hello.txt']);
            done(err);
        });
    });
});
//# sourceMappingURL=artifact-proxy.test.js.map