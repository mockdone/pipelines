"use strict";
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
var express_1 = __importDefault(require("express"));
var express_2 = require("express");
var http_proxy_middleware_1 = __importDefault(require("http-proxy-middleware"));
var utils_1 = require("./utils");
var healthz_1 = require("./handlers/healthz");
var artifacts_1 = require("./handlers/artifacts");
var tensorboard_1 = require("./handlers/tensorboard");
var auth_1 = require("./helpers/auth");
var pod_logs_1 = require("./handlers/pod-logs");
var pod_info_1 = require("./handlers/pod-info");
var gke_metadata_1 = require("./handlers/gke-metadata");
var vis_1 = require("./handlers/vis");
var index_html_1 = require("./handlers/index-html");
var proxy_middleware_1 = __importDefault(require("./proxy-middleware"));
function getRegisterHandler(app, basePath) {
    return function (func, route, handler) {
        func.call(app, route, handler);
        return func.call(app, "" + basePath + route, handler);
    };
}
/**
 * UIServer wraps around a express application to:
 * - proxy requests to ml-pipeline api server
 * - retrieve artifacts from the various backend
 * - create and retrieve new viewer instances
 * - serve static front-end resources (i.e. react app)
 */
var UIServer = /** @class */ (function () {
    function UIServer(options) {
        this.options = options;
        this.app = createUIServer(options);
    }
    /**
     * Starts the http server.
     * @param port optionally overwrite the provided port to listen to.
     */
    UIServer.prototype.start = function (port) {
        if (this.httpServer) {
            throw new Error('UIServer already started.');
        }
        port = port || this.options.server.port;
        this.httpServer = this.app.listen(port, function () {
            console.log('Server listening at http://localhost:' + port);
        });
        return this.httpServer;
    };
    /**
     * Stops the http server.
     */
    UIServer.prototype.close = function () {
        if (this.httpServer) {
            this.httpServer.close();
        }
        this.httpServer = undefined;
        return this;
    };
    return UIServer;
}());
exports.UIServer = UIServer;
function createUIServer(options) {
    var currDir = path_1.default.resolve(__dirname);
    var basePath = options.server.basePath;
    var apiVersionPrefix = options.server.apiVersionPrefix;
    var apiServerAddress = utils_1.getAddress(options.pipeline);
    var envoyServiceAddress = utils_1.getAddress(options.metadata.envoyService);
    var app = express_1.default();
    var registerHandler = getRegisterHandler(app, basePath);
    /** log to stdout */
    app.use(function (req, _, next) {
        console.info(req.method + ' ' + req.originalUrl);
        next();
    });
    /** Healthz */
    registerHandler(app.get, "/" + apiVersionPrefix + "/healthz", healthz_1.getHealthzHandler({
        healthzEndpoint: healthz_1.getHealthzEndpoint(apiServerAddress, apiVersionPrefix),
        healthzStats: healthz_1.getBuildMetadata(currDir),
    }));
    /** Artifact */
    registerHandler(app.get, '/artifacts/get', artifacts_1.getArtifactsProxyHandler({
        enabled: options.artifacts.proxy.enabled,
        namespacedServiceGetter: artifacts_1.getArtifactServiceGetter(options.artifacts.proxy),
    }));
    registerHandler(app.get, '/artifacts/get', artifacts_1.getArtifactsHandler(options.artifacts));
    /** Authorize function */
    var authorizeFn = auth_1.getAuthorizeFn(options.auth, { apiServerAddress: apiServerAddress });
    /** Tensorboard viewer */
    var _a = tensorboard_1.getTensorboardHandlers(options.viewer.tensorboard, authorizeFn), tensorboardGetHandler = _a.get, tensorboardCreateHandler = _a.create, tensorboardDeleteHandler = _a.delete;
    registerHandler(app.get, '/apps/tensorboard', tensorboardGetHandler);
    registerHandler(app.delete, '/apps/tensorboard', tensorboardDeleteHandler);
    registerHandler(app.post, '/apps/tensorboard', tensorboardCreateHandler);
    /** Pod logs */
    registerHandler(app.get, '/k8s/pod/logs', pod_logs_1.getPodLogsHandler(options.argo, options.artifacts));
    /** Pod info */
    registerHandler(app.get, '/k8s/pod', pod_info_1.podInfoHandler);
    registerHandler(app.get, '/k8s/pod/events', pod_info_1.podEventsHandler);
    /** Cluster metadata (GKE only) */
    registerHandler(app.get, '/system/cluster-name', gke_metadata_1.getClusterNameHandler(options.gkeMetadata));
    registerHandler(app.get, '/system/project-id', gke_metadata_1.getProjectIdHandler(options.gkeMetadata));
    /** Visualization */
    registerHandler(app.get, '/visualizations/allowed', vis_1.getAllowCustomVisualizationsHandler(options.visualizations.allowCustomVisualizations));
    /** Proxy metadata requests to the Envoy instance which will handle routing to the metadata gRPC server */
    app.all('/ml_metadata.*', http_proxy_middleware_1.default({
        changeOrigin: true,
        onProxyReq: function (proxyReq) {
            console.log('Metadata proxied request: ', proxyReq.path);
        },
        target: envoyServiceAddress,
    }));
    registerHandler(app.use, [
        // Original API endpoint is /runs/{run_id}:reportMetrics, but ':reportMetrics' means a url parameter, so we don't use : here.
        "/" + apiVersionPrefix + "/runs/*reportMetrics",
        "/" + apiVersionPrefix + "/workflows",
        "/" + apiVersionPrefix + "/scheduledworkflows",
    ], function (req, res) {
        res.status(403).send(req.originalUrl + " endpoint is not meant for external usage.");
    });
    // Order matters here, since both handlers can match any proxied request with a referer,
    // and we prioritize the basepath-friendly handler
    proxy_middleware_1.default(app, basePath + "/" + apiVersionPrefix);
    proxy_middleware_1.default(app, "/" + apiVersionPrefix);
    /** Proxy to ml-pipeline api server */
    app.all("/" + apiVersionPrefix + "/*", http_proxy_middleware_1.default({
        changeOrigin: true,
        onProxyReq: function (proxyReq) {
            console.log('Proxied request: ', proxyReq.path);
        },
        target: apiServerAddress,
    }));
    app.all(basePath + "/" + apiVersionPrefix + "/*", http_proxy_middleware_1.default({
        changeOrigin: true,
        onProxyReq: function (proxyReq) {
            console.log('Proxied request: ', proxyReq.path);
        },
        pathRewrite: function (pathStr) {
            return pathStr.startsWith(basePath) ? pathStr.substr(basePath.length, pathStr.length) : pathStr;
        },
        target: apiServerAddress,
    }));
    /**
     * Modify index.html.
     * These pathes can be matched by static handler. Putting them before it to
     * override behavior for index html.
     */
    var indexHtmlHandler = index_html_1.getIndexHTMLHandler(options.server);
    registerHandler(app.get, '/', indexHtmlHandler);
    registerHandler(app.get, '/index.html', indexHtmlHandler);
    /** Static resource (i.e. react app) */
    app.use(basePath, express_2.static(options.server.staticDir));
    app.use(express_2.static(options.server.staticDir));
    return app;
}
//# sourceMappingURL=app.js.map