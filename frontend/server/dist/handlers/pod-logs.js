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
var workflow_helper_1 = require("../workflow-helper");
/**
 * Returns a handler which attempts to retrieve the logs for the specific pod,
 * in the following order:
 * - retrieve with k8s api
 * - retrieve log archive location from argo workflow status, and retrieve artifact directly
 * - retrieve log archive with the provided argo archive settings
 * @param argoOptions fallback options to retrieve log archive
 * @param artifactsOptions configs and credentials for the different artifact backend
 */
function getPodLogsHandler(argoOptions, artifactsOptions) {
    var _this = this;
    var archiveLogs = argoOptions.archiveLogs, archiveArtifactory = argoOptions.archiveArtifactory, archiveBucketName = argoOptions.archiveBucketName, _a = argoOptions.archivePrefix, archivePrefix = _a === void 0 ? '' : _a;
    // get pod log from the provided bucket and prefix.
    var getPodLogsStreamFromArchive = workflow_helper_1.toGetPodLogsStream(workflow_helper_1.createPodLogsMinioRequestConfig(archiveArtifactory === 'minio' ? artifactsOptions.minio : artifactsOptions.aws, archiveBucketName, archivePrefix));
    // get the pod log stream (with fallbacks).
    var getPodLogsStream = workflow_helper_1.composePodLogsStreamHandler(workflow_helper_1.getPodLogsStreamFromK8s, 
    // if archive logs flag is set, then final attempt will try to retrieve the artifacts
    // from the bucket and prefix provided in the config. Otherwise, only attempts
    // to read from worflow status if the default handler fails.
    archiveLogs && archiveBucketName
        ? workflow_helper_1.composePodLogsStreamHandler(workflow_helper_1.getPodLogsStreamFromWorkflow, getPodLogsStreamFromArchive)
        : workflow_helper_1.getPodLogsStreamFromWorkflow);
    return function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var podName, podNamespace, stream, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.query.podname) {
                        res.status(400).send('podname argument is required');
                        return [2 /*return*/];
                    }
                    podName = decodeURIComponent(req.query.podname);
                    podNamespace = decodeURIComponent(req.query.podnamespace || '') || undefined;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getPodLogsStream(podName, podNamespace)];
                case 2:
                    stream = _a.sent();
                    stream.on('error', function (err) {
                        var _a;
                        if ((err === null || err === void 0 ? void 0 : err.message) &&
                            ((_a = err.message) === null || _a === void 0 ? void 0 : _a.indexOf('Unable to find pod log archive information')) > -1) {
                            res.status(404).send('pod not found');
                        }
                        else {
                            res.status(500).send('Could not get main container logs: ' + err);
                        }
                    });
                    stream.on('end', function () { return res.end(); });
                    stream.pipe(res);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    res.status(500).send('Could not get main container logs: ' + err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
}
exports.getPodLogsHandler = getPodLogsHandler;
//# sourceMappingURL=pod-logs.js.map