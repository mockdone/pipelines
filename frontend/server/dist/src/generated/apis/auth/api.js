"use strict";
/// <reference path="./custom.d.ts" />
// tslint:disable
/**
 * backend/api/auth.proto
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: version not set
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var url = __importStar(require("url"));
var portableFetch = __importStar(require("portable-fetch"));
var BASE_PATH = 'http://localhost'.replace(/\/+$/, '');
/**
 *
 * @export
 */
exports.COLLECTION_FORMATS = {
    csv: ',',
    ssv: ' ',
    tsv: '\t',
    pipes: '|',
};
/**
 *
 * @export
 * @class BaseAPI
 */
var BaseAPI = /** @class */ (function () {
    function BaseAPI(configuration, basePath, fetch) {
        if (basePath === void 0) { basePath = BASE_PATH; }
        if (fetch === void 0) { fetch = portableFetch; }
        this.basePath = basePath;
        this.fetch = fetch;
        if (configuration) {
            this.configuration = configuration;
            this.basePath = configuration.basePath || this.basePath;
        }
    }
    return BaseAPI;
}());
exports.BaseAPI = BaseAPI;
/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
var RequiredError = /** @class */ (function (_super) {
    __extends(RequiredError, _super);
    function RequiredError(field, msg) {
        var _this = _super.call(this, msg) || this;
        _this.field = field;
        return _this;
    }
    return RequiredError;
}(Error));
exports.RequiredError = RequiredError;
/**
 * Type of resources in pipelines system.
 * @export
 * @enum {string}
 */
var AuthorizeRequestResources;
(function (AuthorizeRequestResources) {
    AuthorizeRequestResources[AuthorizeRequestResources["UNASSIGNEDRESOURCES"] = 'UNASSIGNED_RESOURCES'] = "UNASSIGNEDRESOURCES";
    AuthorizeRequestResources[AuthorizeRequestResources["VIEWERS"] = 'VIEWERS'] = "VIEWERS";
})(AuthorizeRequestResources = exports.AuthorizeRequestResources || (exports.AuthorizeRequestResources = {}));
/**
 * Type of verbs that act on the resources.
 * @export
 * @enum {string}
 */
var AuthorizeRequestVerb;
(function (AuthorizeRequestVerb) {
    AuthorizeRequestVerb[AuthorizeRequestVerb["UNASSIGNEDVERB"] = 'UNASSIGNED_VERB'] = "UNASSIGNEDVERB";
    AuthorizeRequestVerb[AuthorizeRequestVerb["CREATE"] = 'CREATE'] = "CREATE";
    AuthorizeRequestVerb[AuthorizeRequestVerb["GET"] = 'GET'] = "GET";
    AuthorizeRequestVerb[AuthorizeRequestVerb["DELETE"] = 'DELETE'] = "DELETE";
})(AuthorizeRequestVerb = exports.AuthorizeRequestVerb || (exports.AuthorizeRequestVerb = {}));
/**
 * AuthServiceApi - fetch parameter creator
 * @export
 */
exports.AuthServiceApiFetchParamCreator = function (configuration) {
    return {
        /**
         *
         * @param {string} [namespace]
         * @param {'UNASSIGNED_RESOURCES' | 'VIEWERS'} [resources]
         * @param {'UNASSIGNED_VERB' | 'CREATE' | 'GET' | 'DELETE'} [verb]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        authorize: function (namespace, resources, verb, options) {
            if (options === void 0) { options = {}; }
            var localVarPath = "/apis/v1beta1/auth";
            var localVarUrlObj = url.parse(localVarPath, true);
            var localVarRequestOptions = Object.assign({ method: 'GET' }, options);
            var localVarHeaderParameter = {};
            var localVarQueryParameter = {};
            // authentication Bearer required
            if (configuration && configuration.apiKey) {
                var localVarApiKeyValue = typeof configuration.apiKey === 'function'
                    ? configuration.apiKey('authorization')
                    : configuration.apiKey;
                localVarHeaderParameter['authorization'] = localVarApiKeyValue;
            }
            if (namespace !== undefined) {
                localVarQueryParameter['namespace'] = namespace;
            }
            if (resources !== undefined) {
                localVarQueryParameter['resources'] = resources;
            }
            if (verb !== undefined) {
                localVarQueryParameter['verb'] = verb;
            }
            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);
            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    };
};
/**
 * AuthServiceApi - functional programming interface
 * @export
 */
exports.AuthServiceApiFp = function (configuration) {
    return {
        /**
         *
         * @param {string} [namespace]
         * @param {'UNASSIGNED_RESOURCES' | 'VIEWERS'} [resources]
         * @param {'UNASSIGNED_VERB' | 'CREATE' | 'GET' | 'DELETE'} [verb]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        authorize: function (namespace, resources, verb, options) {
            var localVarFetchArgs = exports.AuthServiceApiFetchParamCreator(configuration).authorize(namespace, resources, verb, options);
            return function (fetch, basePath) {
                if (fetch === void 0) { fetch = portableFetch; }
                if (basePath === void 0) { basePath = BASE_PATH; }
                return fetch(basePath + localVarFetchArgs.url, localVarFetchArgs.options).then(function (response) {
                    if (response.status >= 200 && response.status < 300) {
                        return response.json();
                    }
                    else {
                        throw response;
                    }
                });
            };
        },
    };
};
/**
 * AuthServiceApi - factory interface
 * @export
 */
exports.AuthServiceApiFactory = function (configuration, fetch, basePath) {
    return {
        /**
         *
         * @param {string} [namespace]
         * @param {'UNASSIGNED_RESOURCES' | 'VIEWERS'} [resources]
         * @param {'UNASSIGNED_VERB' | 'CREATE' | 'GET' | 'DELETE'} [verb]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        authorize: function (namespace, resources, verb, options) {
            return exports.AuthServiceApiFp(configuration).authorize(namespace, resources, verb, options)(fetch, basePath);
        },
    };
};
/**
 * AuthServiceApi - object-oriented interface
 * @export
 * @class AuthServiceApi
 * @extends {BaseAPI}
 */
var AuthServiceApi = /** @class */ (function (_super) {
    __extends(AuthServiceApi, _super);
    function AuthServiceApi() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     *
     * @param {string} [namespace]
     * @param {'UNASSIGNED_RESOURCES' | 'VIEWERS'} [resources]
     * @param {'UNASSIGNED_VERB' | 'CREATE' | 'GET' | 'DELETE'} [verb]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthServiceApi
     */
    AuthServiceApi.prototype.authorize = function (namespace, resources, verb, options) {
        return exports.AuthServiceApiFp(this.configuration).authorize(namespace, resources, verb, options)(this.fetch, this.basePath);
    };
    return AuthServiceApi;
}(BaseAPI));
exports.AuthServiceApi = AuthServiceApi;
//# sourceMappingURL=api.js.map