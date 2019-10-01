# alpha-errors

[![CircleCI](https://circleci.com/gh/wookieb/alpha-errors.svg?style=svg)](https://circleci.com/gh/wookieb/alpha-errors)

Simple system that introduces useful "code" property to your errors and facilitates error management

Features:
* Typescript support
* Custom code generators
* No dependencies
* Custom error properties
* Default error messages

## Install
```
npm install alpha-errors
```

## Usage
```typescript

import {create} from 'alpha-errors';

const errorsDomain = create();

export const Errors = {
    // this creates "error descriptor" - a function that creates final error object
    NOT_FOUND: errorsDomain.create('Entity not found'),
    UNAUTHORIZED: errorsDomain.create('Unauthorized', 20), // custom error code
}

// create via "new"
const notFoundError = new Errors.NOT_FOUND()

notFoundError instanceof Error; // true
notFoundError.code; // 1
notFoundError.message; // Entity not found

// or call like a function
const unauthorizedError = Errors.UNAUTHORIZED('Please login first');

unauthorizedError.code; // 20
unauthorizedError.message; // Please login first
```

## API
See jsdoc in *.d.ts files for detailed api. Below few example

### Custom code generator

```typescript
// built-in generators

import {generators} from 'alpha-errors';

const number = generators.incrementNumber();
number(); // 1
number(); // 2
number(); // 3

const customizedNumber = generators.incrementNumber(100, 10);
customizedNumber(); // 100
customizedNumber(); // 110
customizedNumber(); // 120

// Uses util.format for final code
const format = generators.formatCode('WOO_%d');
format(); // WOO_1
format(); // WOO_2
format(); // WOO_3

const customizedFormat = generators.formatCode('WOO_%d', 100, 10);
format(); // WOO_100
format(); // WOO_110
format(); // WOO_120

// custom formatter function
const customFunctionFormat = generators.formatCode((n) => (n+'').padStart(4, '0'))
format(); // 0001
format(); // 0002
format(); // 0003
```

Provide custom generator for errors domain creator.
```typescript
import {ErrorsDomain, generators} from 'alpha-errors';

const errorsDomain = new ErrorsDomain({codeGenerator: generators.formatCode('WOO_%d')});
const error = errorsDomain.create()() // error.code === 'WOO_1'
```

### Default messages

You can always override default message for event descriptor
```typescript
const error1 = errorsDomain.create('Default message')(); // error1.message === 'Default message'
const error2 = errorsDomain.create('Default message')('New message'); // error1.message === 'New message'
```

### Extra properties

You can inject extra properties to final error. 
```typescript

const errorDescriptor = errorsDomain.create('Default message', undefined, {foo: 'bar', bar: 'noo'});

const error1 = errorDescriptor();
// error1.foo === 'bar'
// error1.bar === 'noo'

const error2 = errorDescriptor(undefined, {foo: 'override bar', newProperty: 'test'});
// error2.foo === 'override bar'
// error2.bar === 'noo'
// error2.newProperty === 'test'
```

### Customize error class

```typescript

const domain = new ErrorsDomain({errorClass: CustomErrorClass});

const errorDescriptor1 = domain.create();
const errorDescriptor2 = domain.create({errorClass: AnotherCustomErrorClass});

errorDescriptor1() instanceof CustomErrorClass; // true
errorDescriptor2() instanceof AnotherCustomErrorClass; // true
```

### Check whether error is the error we're looking for

Extra method `is` checks whether provided object is an object, have the same error code and is an instance of error class defined in descriptor.

```typescript

const INVALID_USER = errorsDomain.create('Invalid user', '1', {errorClass: CustomErrorClass});

INVALID_USER.is(new INVALID_USER); // true
INVALID_USER.is(new Error('Some error')); // false - code doesn't match and it's not an instance of CustomErrorClass
INVALID_USER.is(new CustomErrorClass('Some error')); // false - code doesn't match
```

# Changelog

## 0.3.0
* Added ErrorsDomain.create static method
* Added ErrorsDomain.prototype.createErrors for quick domain errors generation

## 0.2.0
* added "is" method to error descriptors for easy error check

## 0.1.3
* "formatCode" generator accepts custom formatter function

## 0.1.2
* Error descriptor is now an interface
* Added "code" property to error descriptor

## 0.1.1
* Added ability to set errorClass per error descriptor
* Error descriptor options as first argument for ErrorsDomain.prototype.create