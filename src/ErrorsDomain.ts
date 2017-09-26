import {codeGenerator, incrementNumber} from "./codeGenerators";


export type ErrorConstructor = {
    new (message: string): any
};

export interface ErrorsDomainOptions {
    errorClass?: new (message: string) => any,
    codeGenerator?: codeGenerator
}

export interface ErrorDescriptorOptions {
    message?: string;
    code?: string,
    extraProperties?: object
    errorClass?: ErrorConstructor
}

export interface DomainErrorDescriptor {
    (message?: string, extraProperties?: object): any,

    new(message?: string, extraProperties?: object): any;


    defaultMessage: string;
    defaultExtraProperties: object;
    errorClass: ErrorConstructor;
    code: string;

    /**
     * Checks whether given object is the same error
     *
     * @param error
     * @returns {boolean}
     */
    is(error: any): boolean;
}

export class ErrorsDomain {
    private codeToError: Map<string, DomainErrorDescriptor> = new Map();

    constructor(private options: ErrorsDomainOptions = {}) {
        this.options.errorClass = this.options.errorClass || Error;
        this.options.codeGenerator = this.options.codeGenerator || incrementNumber();
    }

    /**
     * Creates a function that is able to create an event with given message, defined code and extra properties
     *
     * @param [options] asdf
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
    create(options?: ErrorDescriptorOptions): DomainErrorDescriptor;
    create(defaultMessage?: string, code?: string | number, defaultExtraProperties?: object): DomainErrorDescriptor;
    create(defaultMessage?: string | ErrorDescriptorOptions, code?: string | number, defaultExtraProperties?: object): DomainErrorDescriptor {

        let errorClass: ErrorConstructor;
        if (defaultMessage !== undefined && typeof defaultMessage === 'object') {
            code = defaultMessage.code;
            defaultExtraProperties = defaultMessage.extraProperties;
            errorClass = defaultMessage.errorClass;
            defaultMessage = defaultMessage.message;
        }

        if (code !== undefined && this.isTaken(code + '')) {
            throw new Error(`Code "${code}" is already taken`);
        }

        code = code === undefined ? this.getFreeCode() : code + '';
        const options = this.options;
        const realErrorClass = errorClass || options.errorClass;
        const errorFunc: DomainErrorDescriptor = <any>function (message?: string, extraProperties: object = {}) {
            const error = new realErrorClass(message || <string>defaultMessage);
            Object.assign(error, defaultExtraProperties, extraProperties, {code});
            return error;
        };
        errorFunc.defaultMessage = <string>defaultMessage;
        errorFunc.defaultExtraProperties = defaultExtraProperties;
        errorFunc.errorClass = realErrorClass;
        errorFunc.code = code;
        errorFunc.is = (error: any) => {
            return typeof error === 'object' && error instanceof realErrorClass && error.code === code;
        };

        this.codeToError.set(code, <DomainErrorDescriptor>errorFunc);
        return <DomainErrorDescriptor>errorFunc;
    }

    /**
     * Returns error descriptor for given code
     */
    findErrorDescriptorForCode(code: string): DomainErrorDescriptor {
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