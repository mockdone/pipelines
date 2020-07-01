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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_proxy_middleware_1 = __importDefault(require("http-proxy-middleware"));
var url_1 = require("url");
function _extractUrlFromReferer(proxyPrefix, referer) {
    if (referer === void 0) { referer = ''; }
    var index = referer.indexOf(proxyPrefix);
    return index > -1 ? referer.substr(index + proxyPrefix.length) : '';
}
exports._extractUrlFromReferer = _extractUrlFromReferer;
function _trimProxyPrefix(proxyPrefix, path) {
    return path.indexOf(proxyPrefix) === 0 ? (path = path.substr(proxyPrefix.length)) : path;
}
exports._trimProxyPrefix = _trimProxyPrefix;
function _routePathWithReferer(proxyPrefix, path, referer) {
    if (referer === void 0) { referer = ''; }
    // If a referer header is included, extract the referer URL, otherwise
    // just trim out the /_proxy/ prefix. Use the origin of the resulting URL.
    var proxiedUrlInReferer = _extractUrlFromReferer(proxyPrefix, referer);
    var decodedPath = decodeURIComponent(proxiedUrlInReferer || _trimProxyPrefix(proxyPrefix, path));
    if (!decodedPath.startsWith('http://') && !decodedPath.startsWith('https://')) {
        decodedPath = 'http://' + decodedPath;
    }
    return new url_1.URL(decodedPath).origin;
}
exports._routePathWithReferer = _routePathWithReferer;
function _rewritePath(proxyPrefix, path, query) {
    // Trim the proxy prefix if exists. It won't exist for any requests made
    // to absolute paths by the proxied resource.
    var querystring = new url_1.URLSearchParams(query).toString();
    var decodedPath = decodeURIComponent(path);
    return _trimProxyPrefix(proxyPrefix, decodedPath) + (querystring && '?' + querystring);
}
exports._rewritePath = _rewritePath;
exports.default = (function (app, apisPrefix) {
    var proxyPrefix = apisPrefix + '/_proxy/';
    app.use(function (req, _, next) {
        // For any request that has a proxy referer header but no proxy prefix,
        // prepend the proxy prefix to it and redirect.
        if (req.headers.referer) {
            var refererUrl = _extractUrlFromReferer(proxyPrefix, req.headers.referer);
            if (refererUrl && req.url.indexOf(proxyPrefix) !== 0) {
                var proxiedUrl = decodeURIComponent(_extractUrlFromReferer(proxyPrefix, req.headers.referer));
                if (!proxiedUrl.startsWith('http://') && !proxiedUrl.startsWith('https://')) {
                    proxiedUrl = 'http://' + proxiedUrl;
                }
                var proxiedOrigin = new url_1.URL(proxiedUrl).origin;
                req.url = proxyPrefix + encodeURIComponent(proxiedOrigin + req.url);
            }
        }
        next();
    });
    app.all(proxyPrefix + '*', http_proxy_middleware_1.default({
        changeOrigin: true,
        logLevel: process.env.NODE_ENV === 'test' ? 'warn' : 'debug',
        target: 'http://127.0.0.1',
        router: function (req) {
            return _routePathWithReferer(proxyPrefix, req.path, req.headers.referer);
        },
        pathRewrite: function (_, req) {
            return _rewritePath(proxyPrefix, req.path, req.query);
        },
    }));
});
//# sourceMappingURL=proxy-middleware.js.map