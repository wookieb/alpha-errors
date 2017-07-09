import {incrementNumber, formatCode} from '../src/codeGenerators';
import {assert} from 'chai';

describe('codeGenerators', () => {
    describe('incrementNumber', () => {
        it('default setup start from 1 and increments by 1', () => {
            const generator = incrementNumber();

            assert.strictEqual(generator(), '1');
            assert.strictEqual(generator(), '2');
        });

        it('custom start number', () => {
            const generator = incrementNumber(101);

            assert.strictEqual(generator(), '101');
            assert.strictEqual(generator(), '102');
            assert.strictEqual(generator(), '103');
        });

        it('custom step and start number', () => {
            const generator = incrementNumber(200, 10);
            assert.strictEqual(generator(), '200');
            assert.strictEqual(generator(), '210');
            assert.strictEqual(generator(), '220');
        });
    });

    describe('formatCode', () => {
        it('formats code using provided', () => {
            const generator = formatCode('WOO_%d');

            assert.strictEqual(generator(), 'WOO_1');
            assert.strictEqual(generator(), 'WOO_2');
            assert.strictEqual(generator(), 'WOO_3');
        });

        it('formats code using provided formatCode, custom number and step', () => {
            const generator = formatCode('WOO_%d', 50, 5);

            assert.strictEqual(generator(), 'WOO_50');
            assert.strictEqual(generator(), 'WOO_55');
            assert.strictEqual(generator(), 'WOO_60');
        });
    });
});