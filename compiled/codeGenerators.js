"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
/**
 * Returns generator that simply increments number by value of step
 *
 * @param [startNumber]
 * @param [step] increment step
 */
function incrementNumber(startNumber = 1, step = 1) {
    let currentNumber = startNumber;
    return () => {
        const result = currentNumber + '';
        currentNumber += step;
        return result;
    };
}
exports.incrementNumber = incrementNumber;
/**
 * Returns generator that generates code by incrementing number by value of step and formats final result using util.formatCode
 *
 * @param format
 * @param startNumber
 * @param step
 */
function formatCode(format, startNumber = 1, step = 1) {
    const numGenerator = incrementNumber(startNumber, step);
    return function () {
        return util_1.format(format, numGenerator());
    };
}
exports.formatCode = formatCode;
