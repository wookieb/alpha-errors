import {CodeGenerator, incrementNumber} from "./codeGenerators";
import {ErrorConstructor} from "./ErrorConstructor";
import {Builder} from "./Builder";
import {Descriptor} from "./Descriptor";

export class Domain {
    readonly errors: Map<string, Descriptor> = new Map();

    private options: Domain.Options;

    constructor(options: Partial<Domain.Options> = {}) {
        this.options = {
            errorClass: options.errorClass || Error,
            codeGenerator: options.codeGenerator || incrementNumber()
        };
    }

    static create(options: Partial<Domain.Options> = {}) {
        return new Domain(options);
    }

    /**
     * Creates a function that is able to create an error with given message, defined code and extra properties
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
    create(options?: Domain.DescriptorOptions): Descriptor;
    create(defaultMessage?: string, code?: string | number, defaultExtraProperties?: object): Descriptor;
    create(defaultMessage?: string | Domain.DescriptorOptions, code?: string | number, defaultExtraProperties?: object): Descriptor {

        let codeCandidate = code;
        if (defaultMessage !== undefined && typeof defaultMessage === 'object') {
            codeCandidate = defaultMessage.code;
        }

        if (codeCandidate !== undefined && this.isTaken(String(codeCandidate))) {
            throw new Error(`Code "${codeCandidate}" is already taken`);
        }

        const builderOptions: Builder.Options = {
            errorClass: this.options.errorClass,
            code: codeCandidate === undefined ? this.getFreeCode() : String(codeCandidate),
            message: typeof defaultMessage === 'string' ? defaultMessage : '',
            extraProperties: defaultExtraProperties ?? undefined
        };

        if (defaultMessage !== undefined && typeof defaultMessage === 'object') {
            builderOptions.extraProperties = defaultMessage.extraProperties;
            builderOptions.errorClass = defaultMessage.errorClass || this.options.errorClass;
            builderOptions.message = defaultMessage.message || '';
        }

        const builder = new Builder(builderOptions);

        const errorFunc: Descriptor = function (message?: string, extraProperties?: object) {
            return builder
                .newBuilder()
                .run(b => {
                    if (message) {
                        b.message(message);
                    }
                })
                .run(b => {
                    if (extraProperties) {
                        b.extraProperties(extraProperties);
                    }
                })
                .create();
        } as any;

        errorFunc.defaultMessage = builderOptions.message;
        errorFunc.defaultExtraProperties = defaultExtraProperties;
        errorFunc.errorClass = builderOptions.errorClass;
        errorFunc.code = builderOptions.code;

        errorFunc.builder = () => {
            return builder.newBuilder();
        }

        errorFunc.is = (error: any) => {
            return typeof error === 'object' &&
                error instanceof builderOptions.errorClass &&
                error.code === builderOptions.code;
        };

        errorFunc.format = (...args: any[]) => {
            return builder.newBuilder()
                .formatMessage(...args)
                .create();
        };

        this.errors.set(builderOptions.code, errorFunc);
        return errorFunc;
    }

    createErrors<T extends Domain.ErrorsFactory>(factory: T): ReturnType<T> {
        return factory(this.create.bind(this)) as ReturnType<T>;
    }

    /**
     * Returns error descriptor for given code
     */
    findErrorDescriptorForCode(code: string): Descriptor | undefined {
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

export namespace Domain {
    export type ErrorsFactory = (createError: Domain['create']) => { [key: string]: Descriptor };

    export interface Options {
        errorClass: ErrorConstructor,
        codeGenerator: CodeGenerator
    }

    export interface DescriptorOptions {
        message?: string;
        code?: string,
        extraProperties?: object
        errorClass?: ErrorConstructor
    }
}