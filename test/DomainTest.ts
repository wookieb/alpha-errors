import {Domain} from '@src/Domain';
import * as faker from 'faker';
import * as sinon from 'sinon';

class CustomErrorClass extends Error {
    constructor(message: string) {
        super(message);
        this.message = message;
        this.name = 'CustomError';
    }
}

function assertCreatedError(error: Error, message: string, code = '1', errorClass: Function = Error) {
    expect(error)
        .toBeInstanceOf(errorClass);
    expect(error)
        .toHaveProperty('message', message);
    expect(error)
        .toHaveProperty('code', code);
}

function assertExtraProperties(error: any, extraProperties: { [key: string]: any }) {
    Object.keys(extraProperties)
        .forEach(propertyName => {
            expect(error)
                .toHaveProperty(propertyName, extraProperties[propertyName]);
        })
}

describe('Domain', () => {
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
            const errorFunc = new Domain().create();
            const error = errorFunc(MESSAGE);

            assertCreatedError(error, MESSAGE);
        });

        it('custom error class', () => {
            const errorFunc = new Domain({errorClass: CustomErrorClass}).create();
            const error = errorFunc(MESSAGE);

            assertCreatedError(error, MESSAGE, '1', CustomErrorClass);
        });

        it('custom error class per descriptor', () => {
            const domain = new Domain();
            const errorFunc = domain.create({errorClass: CustomErrorClass});
            assertCreatedError(errorFunc(MESSAGE), MESSAGE, '1', CustomErrorClass);
        })
    });

    it('creating with "new" operator', () => {
        const errorFunc = new Domain().create();

        const error1 = new errorFunc(MESSAGE);
        const error2 = errorFunc(MESSAGE2);

        assertCreatedError(error1, MESSAGE);
        assertCreatedError(error2, MESSAGE2);
    });

    describe('default message', () => {
        it('used if not provided', () => {
            const errorFunc = new Domain().create(MESSAGE);
            const error = errorFunc();

            assertCreatedError(error, MESSAGE);
        });

        it('ignored if provided', () => {
            const errorFunc = new Domain().create(MESSAGE);
            const error = errorFunc(MESSAGE2);

            assertCreatedError(error, MESSAGE2);
        });

        it('default message from descriptor options', () => {
            const errorFunc = new Domain().create({message: MESSAGE});

            assertCreatedError(errorFunc(), MESSAGE);
            assertCreatedError(errorFunc(MESSAGE2), MESSAGE2);
        });
    });

    describe('extra properties', () => {
        it('default extra properties', () => {
            const errorFunc = new Domain().create(undefined, undefined, EXTRA_PROPERTIES);
            const error = errorFunc(MESSAGE);

            assertCreatedError(error, MESSAGE);
            assertExtraProperties(error, EXTRA_PROPERTIES);
        });

        it('extra properties when creating an error', () => {
            const errorFunc = new Domain().create(undefined, undefined, EXTRA_PROPERTIES);
            const error = errorFunc(MESSAGE, EXTRA_PROPERTIES2);

            assertCreatedError(error, MESSAGE);
            assertExtraProperties(error, {...EXTRA_PROPERTIES, ...EXTRA_PROPERTIES2});
        });

        it('default extra properties from descriptor options', () => {
            const errorFunc = new Domain().create({extraProperties: EXTRA_PROPERTIES});
            const error = errorFunc(MESSAGE);

            assertCreatedError(error, MESSAGE);
            assertExtraProperties(error, EXTRA_PROPERTIES);
        });
    });

    it('customizing code per descriptor', () => {
        const domain = new Domain();

        const errorFunc1 = domain.create(undefined, '10');
        const errorFunc2 = domain.create({code: '20'});

        expect(errorFunc1).toHaveProperty('code', '10');
        assertCreatedError(errorFunc1(MESSAGE), MESSAGE, '10');

        expect(errorFunc2).toHaveProperty('code', '20');
        assertCreatedError(errorFunc2(MESSAGE), MESSAGE, '20');
    });

    it('calls codeGenerator in order to receive new code', () => {
        let i = 0;
        const codeGenerator = sinon.stub().callsFake(() => {
            return (i += 10) + '';
        });

        const errorFunc1 = new Domain({codeGenerator}).create();
        const errorFunc2 = new Domain({codeGenerator}).create();
        const errorFunc3 = new Domain({codeGenerator}).create();

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

        const domain = new Domain({codeGenerator});
        domain.create(undefined, '10');
        domain.create(undefined, '20');

        sinon.assert.notCalled(codeGenerator);

        const error = domain.create()(MESSAGE);
        assertCreatedError(error, MESSAGE, '30');

        sinon.assert.calledThrice(codeGenerator);
    });

    it('checking whether code is taken', () => {
        const domain = new Domain();

        expect(domain.isTaken('1')).toBeFalsy();
        expect(domain.isTaken('2')).toBeFalsy();

        domain.create();
        expect(domain.isTaken('1')).toBeTruthy();
        expect(domain.isTaken('2')).toBeFalsy();

        domain.create();
        expect(domain.isTaken('1')).toBeTruthy();
        expect(domain.isTaken('2')).toBeTruthy();
    });

    it('find error descriptor for code', () => {
        const domain = new Domain();

        const descriptor1 = domain.create();
        const descriptor2 = domain.create();

        expect(domain.findErrorDescriptorForCode('1')).toStrictEqual(descriptor1);
        expect(domain.findErrorDescriptorForCode('2')).toStrictEqual(descriptor2);
    });

    it('attempt to use taken code throws an error', () => {
        const domain = new Domain();
        domain.create(MESSAGE);

        expect(() => {
            domain.create(MESSAGE, '1')
        })
            .toThrowError('Code "1" is already taken');
    });


    it('checking error descriptor with error via "is"', () => {
        const domain = new Domain();

        const SimpleDescriptor = domain.create();
        const customClassDescriptor = domain.create({errorClass: CustomErrorClass});

        expect(SimpleDescriptor.is(new SimpleDescriptor)).toBeTruthy();
        expect(SimpleDescriptor.is(new Error())).toBeFalsy();
        expect(SimpleDescriptor.is({code: SimpleDescriptor.code})).toBeFalsy();

        expect(customClassDescriptor.is(new customClassDescriptor)).toBeTruthy();
        expect(customClassDescriptor.is(new Error())).toBeFalsy();
        expect(customClassDescriptor.is({code: customClassDescriptor.code})).toBeFalsy();
        expect(customClassDescriptor.is(new CustomErrorClass('test'))).toBeFalsy();
    });

    it('using message formatting', () => {
        const descriptor = new Domain().create('How about %s?');

        expect(descriptor.format('foo'))
            .toHaveProperty('message', 'How about foo?');
    });
});