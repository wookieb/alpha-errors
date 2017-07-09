import {formatCode, incrementNumber} from "./codeGenerators";
import {ErrorsDomain, ErrorsDomainOptions} from "./ErrorsDomain";
export {ErrorsDomain, ErrorsDomainOptions, domainErrorDescriptor} from './ErrorsDomain';

export {codeGenerator} from './codeGenerators';

export const generators = {
    incrementNumber,
    formatCode
};

/**
 * Creates error domain
 */
export function create(options: ErrorsDomainOptions = {}) {
    return new ErrorsDomain(options);
}