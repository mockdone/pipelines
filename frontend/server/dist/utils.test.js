"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright 2020 Google LLC
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
var utils_1 = require("./utils");
describe('utils', function () {
    describe('PreviewStream', function () {
        it('should stream first 5 bytes', function (done) {
            var peek = 5;
            var input = 'some string that will be truncated.';
            var source = new stream_1.PassThrough();
            var preview = new utils_1.PreviewStream({ peek: peek });
            var dst = source.pipe(preview).on('end', done);
            source.end(input);
            dst.once('readable', function () { return expect(dst.read().toString()).toBe(input.slice(0, peek)); });
        });
        it('should stream everything if peek==0', function (done) {
            var peek = 0;
            var input = 'some string that will be truncated.';
            var source = new stream_1.PassThrough();
            var preview = new utils_1.PreviewStream({ peek: peek });
            var dst = source.pipe(preview).on('end', done);
            source.end(input);
            dst.once('readable', function () { return expect(dst.read().toString()).toBe(input); });
        });
    });
});
//# sourceMappingURL=utils.test.js.map