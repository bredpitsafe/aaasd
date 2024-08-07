import { convertObjectToLogMessage } from './utils.ts';

describe('logging utils', () => {
    describe('convertObjectToLogMessage', () => {
        const cases: [any, any][] = [
            [{}, {}],
            [{ prop: 'value' }, { prop: 'string' }],
            [{ prop: 123 }, { prop: 'number' }],
            [{ prop: true }, { prop: 'boolean' }],
            [{ prop: null }, { prop: 'nil' }],
            [{ prop: undefined }, { prop: 'nil' }],
            [{ prop: [] }, { prop: 'array:0' }],
            [{ prop: [1, 2, 3] }, { prop: 'array:3' }],
            [{ prop: [{ nested: 1 }, { nested: 2 }, { nested: 3 }] }, { prop: 'array:3' }],
            [{ prop: { nested: { object: 1 } } }, { prop: 'object' }],
            [{ prop: { nested: { array: [1, 2, 3] } } }, { prop: 'object' }],
            ['value', 'string'],
            [123, 'number'],
            [null, 'nil'],
            [undefined, 'nil'],
            [true, 'boolean'],
        ];

        test.each(cases)('Test case - %#', (inObj, outObj) => {
            expect(convertObjectToLogMessage(inObj)).toEqual(outObj);
        });
    });
});
