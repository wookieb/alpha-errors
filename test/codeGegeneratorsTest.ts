import {incrementNumber, formatCode} from '@src/codeGenerators';

describe('codeGenerators', () => {
	describe('incrementNumber', () => {
		it('default setup start from 1 and increments by 1', () => {
			const generator = incrementNumber();

			expect(generator()).toEqual('1');
			expect(generator()).toEqual('2');
		});

		it('custom start number', () => {
			const generator = incrementNumber(101);

			expect(generator()).toEqual('101');
			expect(generator()).toEqual('102');
			expect(generator()).toEqual('103');
		});

		it('custom step and start number', () => {
			const generator = incrementNumber(200, 10);
			expect(generator()).toEqual('200');
			expect(generator()).toEqual('210');
			expect(generator()).toEqual('220');
		});
	});

	describe('formatCode', () => {
		it('formats code using provided', () => {
			const generator = formatCode('WOO_%d');

			expect(generator()).toEqual('WOO_1');
			expect(generator()).toEqual('WOO_2');
			expect(generator()).toEqual('WOO_3');
		});

		it('formats code using provided formatCode, custom number and step', () => {
			const generator = formatCode('WOO_%d', 50, 5);

			expect(generator()).toEqual('WOO_50');
			expect(generator()).toEqual('WOO_55');
			expect(generator()).toEqual('WOO_60');
		});

		it('formats code using custom function', () => {
			const generator = formatCode(n => (n * 2) + '');
			expect(generator()).toEqual('2');
			expect(generator()).toEqual('4');
			expect(generator()).toEqual('6');
		})
	});
});