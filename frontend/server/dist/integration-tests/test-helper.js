"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var os = __importStar(require("os"));
var fs = __importStar(require("fs"));
function commonSetup(options) {
    if (options === void 0) { options = {}; }
    var indexHtmlPath = path.resolve(os.tmpdir(), 'index.html');
    var argv = ['node', 'dist/server.js', os.tmpdir(), '3000'];
    var buildDate = new Date().toISOString();
    var commitHash = options.commitHash || 'abcdefg';
    var tagName = options.tagName || '1.0.0';
    var indexHtmlContent = "\n<html>\n<head>\n  <script>\n  window.KFP_FLAGS.DEPLOYMENT=null\n  </script>\n  <script id=\"kubeflow-client-placeholder\"></script>\n</head>\n</html>";
    beforeAll(function () {
        console.log('beforeAll, writing files');
        fs.writeFileSync(path.resolve(__dirname, '..', 'BUILD_DATE'), buildDate);
        fs.writeFileSync(path.resolve(__dirname, '..', 'COMMIT_HASH'), commitHash);
        fs.writeFileSync(path.resolve(__dirname, '..', 'TAG_NAME'), tagName);
        fs.writeFileSync(indexHtmlPath, indexHtmlContent);
    });
    beforeEach(function () {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });
    return { argv: argv, buildDate: buildDate, indexHtmlPath: indexHtmlPath, indexHtmlContent: indexHtmlContent };
}
exports.commonSetup = commonSetup;
function buildQuery(queriesMap) {
    var queryContent = Object.entries(queriesMap)
        .filter(function (entry) { return entry[1] != null; })
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        return key + "=" + encodeURIComponent(value);
    })
        .join('&');
    if (!queryContent) {
        return '';
    }
    return "?" + queryContent;
}
exports.buildQuery = buildQuery;
//# sourceMappingURL=test-helper.js.map