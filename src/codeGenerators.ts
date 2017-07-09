import {format as formatEntry} from 'util';
export type codeGenerator = () => string;

/**
 * Returns generator that simply increments number by value of step
 *
 * @param [startNumber]
 * @param [step] increment step
 */
export function incrementNumber(startNumber: number = 1, step: number = 1): codeGenerator {
    let currentNumber = startNumber;
    return () => {
        const result = currentNumber + '';
        currentNumber += step;
        return result;
    }
}

/**
 * Returns generator that generates code by incrementing number by value of step and formats final result using util.formatCode
 *
 * @param format
 * @param startNumber
 * @param step
 */
export function formatCode(format: string, startNumber: number = 1, step: number = 1): codeGenerator {
    const numGenerator = incrementNumber(startNumber, step);

    return function () {
        return formatEntry(format, numGenerator());
    }
}