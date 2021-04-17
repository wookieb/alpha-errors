import {Builder} from "@src/Builder";
import * as faker from 'faker';

describe('Builder', () => {
	let builder: Builder;

	class First {
		constructor(readonly message: string) {

		}
	}

	const MESSAGE = faker.lorem.sentence();

	beforeEach(() => {
		builder = new Builder({
			message: MESSAGE,
			errorClass: First,
			code: '1',
		});
	});

	it('overriding error class', () => {
		class Second {
			constructor(readonly message: string) {
			}
		}

		const builder = new Builder({errorClass: First, message: '', code: '1'});

		const result = builder
			.overrideErrorConstructor(Second)
			.create();

		expect(result)
			.toBeInstanceOf(Second);
	});

	describe('defining message', () => {
		it('explicitly', () => {
			const message = faker.lorem.sentence();
			const result = builder
				.message(message)
				.create();

			expect(result)
				.toHaveProperty('message', message);
		});

		it('formatting default message', () => {
			const builder = new Builder({
				message: 'How are you %s?',
				code: '1',
				errorClass: First
			});

			const result = builder
				.formatMessage('foo')
				.create();

			expect(result)
				.toHaveProperty('message', 'How are you foo?');
		});

		it('formatting new message', () => {
			const result = builder
				.formatNewMessage('Is everything alrighty %s?', 'foo')
				.create();

			expect(result)
				.toHaveProperty('message', 'Is everything alrighty foo?');
		});
	});
});