import {ErrorsDomain} from '../src/ErrorsDomain';
import {assert} from 'chai';
import * as faker from 'faker';
import * as sinon from 'sinon';

class CustomErrorClass extends Error {
    constructor(message: string) {
        super(message);
        this.message = message;
        this.name = 'CustomError';
    }
}

function assertCreatedError(error: Error, message, code = '1', errorClass: Function = Error) {
    assert.instanceOf(error, errorClass);
    assert.propertyVal(error, 'message', message);
    assert.propertyVal(error, 'code', code);
}

function assertExtraProperties(error: Error, extraProperties: object) {
    Object.keys(extraProperties)
        .forEach(propertyName => {
            assert.propertyVal(error, propertyName, extraProperties[propertyName]);
        })
}

describe('ErrorsDomain', () => {
    const MESSAGE = faker.lorem.sentence();
    const MESSAGE2 = faker.lorem.sentence();
    const EXTRA_PROPERTIES = {
        [faker.lorem.word()]: faker.lorem.sentence(),
        [faker.lorem.word()]: faker.random.number()
    };

    const EXTRA_PROPERTIES2 = {
        [faker.lorem.word()]: faker.lorem.sentence(),
        [faker.lorem.word()]: faker.random.number()
    };

    describe('using custom error class', () => {
        it('default "Error" used', () => {
            const errorFunc = new ErrorsDomain().create();
            const error = errorFunc(MESSAGE);

            assertCreatedError(error, MESSAGE);
        });

        it('custom error class', () => {
            const errorFunc = new ErrorsDomain({errorClass: CustomErrorClass}).create();
            const error = errorFunc(MESSAGE);

            assertCreatedError(error, MESSAGE, '1', CustomErrorClass);
        });

        it('custom error class per descriptor', () => {
            const domain = new ErrorsDomain();
            const errorFunc = domain.create({errorClass: CustomErrorClass});
            assertCreatedError(errorFunc(MESSAGE), MESSAGE, '1', CustomErrorClass);
        })
    });

    it('creating with "new" operator', () => {
        const errorFunc = new ErrorsDomain().create();

        const error1 = new errorFunc(MESSAGE);
        const error2 = errorFunc(MESSAGE2);

        assertCreatedError(error1, MESSAGE);
        assertCreatedError(error2, MESSAGE2);
    });

    describe('default message', () => {
        it('used if not provided', () => {
            const errorFunc = new ErrorsDomain().create(MESSAGE);
            const error = errorFunc();

            assertCreatedError(error, MESSAGE);
        });

        it('ignored if provided', () => {
            const errorFunc = new ErrorsDomain().create(MESSAGE);
            const error = errorFunc(MESSAGE2);

            assertCreatedError(error, MESSAGE2);
        });

        it('default message from descriptor options', () => {
            const errorFunc = new ErrorsDomain().create({message: MESSAGE});

            assertCreatedError(errorFunc(), MESSAGE);
            assertCreatedError(errorFunc(MESSAGE2), MESSAGE2);
        });
    });

    describe('extra properties', () => {
        it('default extra properties', () => {
            const errorFunc = new ErrorsDomain().create(undefined, undefined, EXTRA_PROPERTIES);
            const error = errorFunc(MESSAGE);

            assertCreatedError(error, MESSAGE);
            assertExtraProperties(error, EXTRA_PROPERTIES);
        });

        it('extra properties when creating an error', () => {
            const errorFunc = new ErrorsDomain().create(undefined, undefined, EXTRA_PROPERTIES);
            const error = errorFunc(MESSAGE, EXTRA_PROPERTIES2);

            assertCreatedError(error, MESSAGE);
            assertExtraProperties(error, {...EXTRA_PROPERTIES, ...EXTRA_PROPERTIES2});
        });

        it('default extra properties from descriptor options', () => {
            const errorFunc = new ErrorsDomain().create({extraProperties: EXTRA_PROPERTIES});
            const error = errorFunc(MESSAGE);

            assertCreatedError(error, MESSAGE);
            assertExtraProperties(error, EXTRA_PROPERTIES);
        });
    });

    it('customizing code per descriptor', () => {
        const domain = new ErrorsDomain();

        const errorFunc1 = domain.create(undefined, '10');
        const errorFunc2 = domain.create({code: '20'});

        assertCreatedError(errorFunc1(MESSAGE), MESSAGE, '10');
        assertCreatedError(errorFunc2(MESSAGE), MESSAGE, '20');
    });

    it('calls codeGenerator in order to receive new code', () => {
        let i = 0;
        const codeGenerator = sinon.stub().callsFake(() => {
            return (i += 10) + '';
        });

        const errorFunc1 = new ErrorsDomain({codeGenerator}).create();
        const errorFunc2 = new ErrorsDomain({codeGenerator}).create();
        const errorFunc3 = new ErrorsDomain({codeGenerator}).create();

        assertCreatedError(errorFunc1(MESSAGE), MESSAGE, '10');
        assertCreatedError(errorFunc2(MESSAGE), MESSAGE, '20');
        assertCreatedError(errorFunc3(MESSAGE), MESSAGE, '30');

        sinon.assert.calledThrice(codeGenerator);
    });

    it('calls codeGenerator until find first free code', () => {
        let i = 0;
        const codeGenerator = sinon.stub().callsFake(() => {
            return (i += 10) + '';
        });

        const domain = new ErrorsDomain({codeGenerator});
        domain.create(undefined, '10');
        domain.create(undefined, '20');

        sinon.assert.notCalled(codeGenerator);

        const error = domain.create()(MESSAGE);
        assertCreatedError(error, MESSAGE, '30');

        sinon.assert.calledThrice(codeGenerator);
    });

    it('checking whether code is taken', () => {
        const domain = new ErrorsDomain();

        assert.isFalse(domain.isTaken('1'));
        assert.isFalse(domain.isTaken('2'));

        domain.create();
        assert.isTrue(domain.isTaken('1'));
        assert.isFalse(domain.isTaken('2'));

        domain.create();
        assert.isTrue(domain.isTaken('1'));
        assert.isTrue(domain.isTaken('2'));
    });

    it('find error descriptor for code', () => {
        const domain = new ErrorsDomain();

        const descriptor1 = domain.create();
        const descriptor2 = domain.create();

        assert.strictEqual(domain.findErrorDescriptorForCode('1'), descriptor1);
        assert.strictEqual(domain.findErrorDescriptorForCode('2'), descriptor2);
    });

    it('attempt to use taken code throws an error', () => {
        const domain = new ErrorsDomain();
        domain.create(MESSAGE);

        assert.throws(() => {
            domain.create(MESSAGE, '1')
        }, Error, 'Code "1" is already taken');
    });
});