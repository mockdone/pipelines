"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var configs_1 = require("../configs");
var DEFAULT_FLAG = 'window.KFP_FLAGS.DEPLOYMENT=null';
var KUBEFLOW_CLIENT_PLACEHOLDER = '<script id="kubeflow-client-placeholder"></script>';
/**
 * Returns a handler which retrieve and modify the index.html.
 * @param options.staticDir serve the static resources in this folder.
 * @param options.deployment whether this is a kubeflow deployment.
 */
function getIndexHTMLHandler(options) {
    var content = replaceRuntimeContent(loadIndexHtml(options.staticDir), options.deployment);
    return function handleIndexHtml(_, res) {
        if (content) {
            res.contentType('text/html');
            res.send(content);
        }
        else {
            res.sendStatus(404);
        }
    };
}
exports.getIndexHTMLHandler = getIndexHTMLHandler;
function loadIndexHtml(staticDir) {
    var filepath = path.resolve(staticDir, 'index.html');
    var content = fs.readFileSync(filepath).toString();
    // sanity checking
    if (!content.includes(DEFAULT_FLAG)) {
        throw new Error("Error: cannot find default flag: '" + DEFAULT_FLAG + "' in index html. Its content: '" + content + "'.");
    }
    if (!content.includes(KUBEFLOW_CLIENT_PLACEHOLDER)) {
        throw new Error("Error: cannot find kubeflow client placeholder: '" + KUBEFLOW_CLIENT_PLACEHOLDER + "' in index html. Its content: '" + content + "'.");
    }
    return content;
}
function replaceRuntimeContent(content, deployment) {
    if (content && deployment === configs_1.Deployments.KUBEFLOW) {
        return content
            .replace(DEFAULT_FLAG, 'window.KFP_FLAGS.DEPLOYMENT="KUBEFLOW"')
            .replace(KUBEFLOW_CLIENT_PLACEHOLDER, "<script id=\"kubeflow-client-placeholder\" src=\"/dashboard_lib.bundle.js\"></script>");
    }
    if (content && deployment === configs_1.Deployments.MARKETPLACE) {
        return content.replace(DEFAULT_FLAG, 'window.KFP_FLAGS.DEPLOYMENT="MARKETPLACE"');
    }
    return content;
}
//# sourceMappingURL=index-html.js.map