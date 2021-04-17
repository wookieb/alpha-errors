import {formatCode, incrementNumber} from "./codeGenerators";

export {CodeGenerator} from './codeGenerators';
export * from './Domain';
export * from './Descriptor';
export * from './ErrorConstructor';
export * from './Builder';

export const generators = {
    incrementNumber,
    formatCode
};