"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Return a handler which return whether custom visualization is allowed by the
 * ml-pipeline ui server.
 * @param allowed whether custom visualization is permitted.
 */
function getAllowCustomVisualizationsHandler(allowed) {
    return function (_, res) {
        res.send(allowed);
    };
}
exports.getAllowCustomVisualizationsHandler = getAllowCustomVisualizationsHandler;
//# sourceMappingURL=vis.js.map