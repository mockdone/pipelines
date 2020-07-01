"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
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
var os = __importStar(require("os"));
var configs_1 = require("./configs");
describe('loadConfigs', function () {
    it('should throw error if no static dir provided', function () {
        var argv = ['node', 'dist/server.js'];
        expect(function () { return configs_1.loadConfigs(argv, {}); }).toThrowError();
    });
    it('default port should be 3000', function () {
        var tmpdir = os.tmpdir();
        var configs = configs_1.loadConfigs(['node', 'dist/server.js', tmpdir], {});
        expect(configs.server.port).toBe(3000);
        expect(configs.server.staticDir).toBe(tmpdir);
    });
});
//# sourceMappingURL=configs.test.js.map