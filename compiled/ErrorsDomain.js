"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codeGenerators_1 = require("./codeGenerators");
class ErrorsDomain {
    constructor(options = {}) {
        this.options = options;
        this.codeToError = new Map();
        this.options.errorClass = this.options.errorClass || Error;
        this.options.codeGenerator = this.options.codeGenerator || codeGenerators_1.incrementNumber();
    }
    /**
     * Creates error descriptor
     * @param [defaultMessage]
     * @param [code] code to use
     * @param [defaultExtraProperties] additional properties to inject to the final error object
     */
    create(defaultMessage, code, defaultExtraProperties = {}) {
        if (code !== undefined && this.isTaken(code)) {
            throw new Error(`Code "${code}" is already taken`);
        }
        code = code === undefined ? this.getFreeCode() : code;
        const errorFunc = (message, extraProperties = {}) => {
            const error = new this.options.errorClass(message || defaultMessage);
            Object.assign(error, defaultExtraProperties, extraProperties, { code });
            return error;
        };
        errorFunc.defaultMessage = defaultMessage;
        errorFunc.defaultExtraProperties = defaultExtraProperties;
        this.codeToError.set(code, errorFunc);
        return errorFunc;
    }
    /**
     * Returns error descriptor for given code
     */
    findErrorDescriptorForCode(code) {
        return this.codeToError.get(code);
    }
    getFreeCode() {
        let nextCode;
        do {
            nextCode = this.options.codeGenerator();
        } while (this.codeToError.get(nextCode));
        return nextCode;
    }
    /**
     * Checks whether given code is taken
     */
    isTaken(code) {
        return this.codeToError.has(code);
    }
    get errors() {
        return this.codeToError;
    }
}
exports.ErrorsDomain = ErrorsDomain;
