# alpha-errors

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
```

Provide custom generator for errors domain creator.
```typescript
import {create, generators} from 'alpha-errors';

const errorsDomain = create({codeGenerator: generators.formatCode('WOO_%d')});
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