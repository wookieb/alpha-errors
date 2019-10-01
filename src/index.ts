import {formatCode, incrementNumber} from "./codeGenerators";

export {CodeGenerator} from './codeGenerators';
export * from './ErrorsDomain';

export const generators = {
    incrementNumber,
    formatCode
};