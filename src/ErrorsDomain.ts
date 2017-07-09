import {codeGenerator, incrementNumber} from "./codeGenerators";

export interface ErrorsDomainOptions {
    errorClass?: new (message: string) => any,
    codeGenerator?: codeGenerator
}

export type domainErrorDescriptor = {
    (message?: string, extraProperties?: object): any,
    new(message?: string, extraProperties?: object): any;

    defaultMessage: string;
    defaultExtraProperties: object
}

export class ErrorsDomain {
    private codeToError: Map<string, domainErrorDescriptor> = new Map();

    constructor(private options: ErrorsDomainOptions = {}) {
        this.options.errorClass = this.options.errorClass || Error;
        this.options.codeGenerator = this.options.codeGenerator || incrementNumber();
    }

    /**
     * Creates a function that is able to create an event with given message, defined code and extra properties
     *
     * @param [defaultMessage] default message to use it not provided to error descriptor
     * @param [code] code to use
     * @param [defaultExtraProperties] additional properties to inject to the final error object
     *
     * @example
     * const errDomain = new ErrorsDomain();
     * export const errors = {
     *  NOT_FOUND: errDomain.create('Smth not found'),
     *  INVALID: errDomain.create('Smth is not valid')
     * }
     *
     * throw new errors.NOT_FOUND('User not found');
     * // or
     * throw errors.NOT_FOUND('User not found')
     */
    create(defaultMessage?: string, code?: string, defaultExtraProperties: object = {}): domainErrorDescriptor {
        if (code !== undefined && this.isTaken(code)) {
            throw new Error(`Code "${code}" is already taken`);
        }

        code = code === undefined ? this.getFreeCode() : code;
        const options = this.options;
        const errorFunc = function (message?: string, extraProperties: object = {}) {
            const error = new options.errorClass(message || defaultMessage);
            Object.assign(error, defaultExtraProperties, extraProperties, {code});
            return error;
        };
        (<domainErrorDescriptor>errorFunc).defaultMessage = defaultMessage;
        (<domainErrorDescriptor>errorFunc).defaultExtraProperties = defaultExtraProperties;

        this.codeToError.set(code, <domainErrorDescriptor>errorFunc);
        return <domainErrorDescriptor>errorFunc;
    }

    /**
     * Returns error descriptor for given code
     */
    findErrorDescriptorForCode(code: string): domainErrorDescriptor {
        return this.codeToError.get(code);
    }

    private getFreeCode(): string {
        let nextCode;
        do {
            nextCode = this.options.codeGenerator();
        } while (this.codeToError.get(nextCode));
        return nextCode;
    }

    /**
     * Checks whether given code is taken
     */
    isTaken(code: string) {
        return this.codeToError.has(code);
    }

    get errors() {
        return this.codeToError;
    }
}