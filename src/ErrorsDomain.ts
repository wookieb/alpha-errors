import {CodeGenerator, incrementNumber} from "./codeGenerators";

export interface ErrorConstructor {
    new(message: string): any
}

export class ErrorsDomain {
    readonly errors: Map<string, ErrorsDomain.ErrorDescriptor> = new Map();

    private options: ErrorsDomain.Options;

    constructor(options: Partial<ErrorsDomain.Options> = {}) {
        this.options = {
            errorClass: options.errorClass || Error,
            codeGenerator: options.codeGenerator || incrementNumber()
        };
    }

    static create(options: Partial<ErrorsDomain.Options> = {}) {
        return new ErrorsDomain(options);
    }

    /**
     * Creates a function that is able to create an event with given message, defined code and extra properties
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
    create(options?: ErrorsDomain.DescriptorOptions): ErrorsDomain.ErrorDescriptor;
    create(defaultMessage?: string, code?: string | number, defaultExtraProperties?: object): ErrorsDomain.ErrorDescriptor;
    create(defaultMessage?: string | ErrorsDomain.DescriptorOptions, code?: string | number, defaultExtraProperties?: object): ErrorsDomain.ErrorDescriptor {

        let ErrorClass: ErrorConstructor = this.options.errorClass;
        if (defaultMessage !== undefined && typeof defaultMessage === 'object') {
            code = defaultMessage.code;
            defaultExtraProperties = defaultMessage.extraProperties;
            ErrorClass = defaultMessage.errorClass || this.options.errorClass;
            defaultMessage = defaultMessage.message;
        }

        if (code !== undefined && this.isTaken(code + '')) {
            throw new Error(`Code "${code}" is already taken`);
        }

        code = code === undefined ? this.getFreeCode() : code + '';
        const errorFunc = function (message?: string, extraProperties: object = {}) {
            const error = new ErrorClass(message || defaultMessage as string);
            Object.assign(error, defaultExtraProperties || {}, extraProperties, {code});
            return error;
        } as ErrorsDomain.ErrorDescriptor;
        errorFunc.defaultMessage = defaultMessage as string;
        errorFunc.defaultExtraProperties = defaultExtraProperties;
        errorFunc.errorClass = ErrorClass;
        errorFunc.code = code;
        errorFunc.is = (error: any) => {
            return typeof error === 'object' && error instanceof ErrorClass && error.code === code;
        };

        this.errors.set(code, errorFunc as ErrorsDomain.ErrorDescriptor);
        return errorFunc;
    }

    createErrors<T extends ErrorsDomain.ErrorsFactory>(factory: T): ReturnType<T> {
        return factory(this.create.bind(this)) as ReturnType<T>;
    }

    /**
     * Returns error descriptor for given code
     */
    findErrorDescriptorForCode(code: string): ErrorsDomain.ErrorDescriptor | undefined {
        return this.errors.get(code);
    }

    private getFreeCode(): string {
        let nextCode;
        do {
            nextCode = this.options.codeGenerator();
        } while (this.errors.get(nextCode));
        return nextCode;
    }

    /**
     * Checks whether given code is taken
     */
    isTaken(code: string) {
        return this.errors.has(code);
    }
}

export namespace ErrorsDomain {
    export type ErrorsFactory = (createError: ErrorsDomain['create']) => { [key: string]: ErrorsDomain.ErrorDescriptor };

    export interface Options {
        errorClass: new (message: string) => any,
        codeGenerator: CodeGenerator
    }

    export interface DescriptorOptions {
        message?: string;
        code?: string,
        extraProperties?: object
        errorClass?: ErrorConstructor
    }

    export interface ErrorDescriptor {
        (message?: string, extraProperties?: object): any,

        new(message?: string, extraProperties?: object): any;

        defaultMessage: string;
        defaultExtraProperties?: object;
        errorClass: ErrorConstructor;
        code: string;

        /**
         * Checks whether given object is the same error
         */
        is(error: any): boolean;
    }
}