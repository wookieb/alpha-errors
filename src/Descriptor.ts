import {ErrorConstructor} from "./ErrorConstructor";
import {Builder} from "./Builder";

export interface Descriptor {
	(message?: string, extraProperties?: object): any,

	new(message?: string, extraProperties?: object): any;

	format(...args: any[]): any;

	builder(): Builder;

	defaultMessage: string;
	defaultExtraProperties?: object;
	errorClass: ErrorConstructor;
	code: string;

	/**
	 * Checks whether given object is the same error
	 */
	is(error: any): boolean;
}