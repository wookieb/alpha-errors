export { ErrorsDomain, ErrorsDomainOptions, domainErrorDescriptor } from './ErrorsDomain';
export { codeGenerator } from './codeGenerators';
export declare const generators: {
    incrementNumber: (startNumber?: number, step?: number) => () => string;
    formatCode: (format: string, startNumber?: number, step?: number) => () => string;
};
