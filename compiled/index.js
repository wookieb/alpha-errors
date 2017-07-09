"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codeGenerators_1 = require("./codeGenerators");
var ErrorsDomain_1 = require("./ErrorsDomain");
exports.ErrorsDomain = ErrorsDomain_1.ErrorsDomain;
exports.generators = {
    incrementNumber: codeGenerators_1.incrementNumber,
    formatCode: codeGenerators_1.formatCode
};
