export declare type codeGenerator = () => string;
/**
 * Returns generator that simply increments number by value of step
 *
 * @param [startNumber]
 * @param [step] increment step
 */
export declare function incrementNumber(startNumber?: number, step?: number): codeGenerator;
/**
 * Returns generator that generates code by incrementing number by value of step and formats final result using util.formatCode
 *
 * @param format
 * @param startNumber
 * @param step
 */
export declare function formatCode(format: string, startNumber?: number, step?: number): codeGenerator;
