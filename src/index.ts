import {formatCode, incrementNumber} from "./codeGenerators";
import {Registry} from "./Registry";

export {CodeGenerator} from './codeGenerators';
export * from './Domain';
export * from './Descriptor';
export * from './ErrorConstructor';
export * from './Builder';
export * from './Registry';

export const globalRegistry = new Registry();
export const registry = globalRegistry;

export const generators = {
	incrementNumber,
	formatCode
};