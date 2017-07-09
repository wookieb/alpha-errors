import { codeGenerator } from "./codeGenerators";
export interface ErrorsDomainOptions {
    errorClass?: new (message: string) => any;
    codeGenerator?: codeGenerator;
}
export declare type domainErrorDescriptor = {
    (message?: string, extraProperties?: object): any;
    new (message?: string, extraProperties?: object): any;
    defaultMessage: string;
    defaultExtraProperties: object;
};
export declare class ErrorsDomain {
    private options;
    private codeToError;
    constructor(options?: ErrorsDomainOptions);
    /**
     * Creates error descriptor
     * @param [defaultMessage]
     * @param [code] code to use
     * @param [defaultExtraProperties] additional properties to inject to the final error object
     */
    create(defaultMessage?: string, code?: string, defaultExtraProperties?: object): domainErrorDescriptor;
    /**
     * Returns error descriptor for given code
     */
    findErrorDescriptorForCode(code: string): domainErrorDescriptor;
    private getFreeCode();
    /**
     * Checks whether given code is taken
     */
    isTaken(code: string): boolean;
    readonly errors: Map<string, domainErrorDescriptor>;
}
