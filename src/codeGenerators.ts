import {format as formatEntry} from 'util';
export type codeGenerator = () => string;


export function incrementNumberGenerator(startNumber: number = 1, step: number = 1) {
    let currentNumber = startNumber;
    return () => {
        const result = currentNumber;
        currentNumber += step;
        return result;
    }
}

/**
 * Returns generator that simply increments number by value of step
 */
export function incrementNumber(startNumber: number = 1, step: number = 1): codeGenerator {
    const numGenerator = incrementNumberGenerator(startNumber, step);
    return () => {
        return numGenerator() + '';
    }
}

/**
 * Returns generator that generates code by incrementing number by value of step and formats final result using util.format or provided function
 */
export function formatCode(format: string | ((n: number) => string), startNumber: number = 1, step: number = 1): codeGenerator {
    const numGenerator = incrementNumberGenerator(startNumber, step);

    const formatter = typeof format === 'string' ? formatEntry.bind(this, format) : format;
    return function () {
        return formatter(numGenerator());
    }
}
