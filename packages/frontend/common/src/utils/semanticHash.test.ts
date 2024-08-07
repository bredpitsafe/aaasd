import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { isEmpty } from 'lodash-es';

import { EMPTY_OBJECT } from './const';
import { getSocketUrlHash } from './hash/getSocketUrlHash.ts';
import { semanticHash } from './semanticHash';

describe('hash', () => {
    describe('simpleStruct', () => {
        type TSimpleStruct = {
            a: number;
            b: number;
        };

        const simpleStruct: TSimpleStruct = {
            a: 1,
            b: 2,
        };

        const getHash1 = (value: TSimpleStruct) => semanticHash.get(value, EMPTY_OBJECT);

        it('Deterministic result', () => {
            const hash = getHash1(simpleStruct);
            expect(getHash1(simpleStruct)).toBe(hash);
            expect(getHash1({ ...simpleStruct })).toBe(hash);
        });
    });
    describe('myStruct', () => {
        class MyNonCloneableClass {
            hello = 'world';
        }

        type TMyStruct = {
            a: number;
            b: number[];
            c: {
                a: number;
                b: number[];
            };
            d: [
                {
                    b: number[];
                    c: {
                        d: { a: number }[];
                    };
                },
            ];
            f: MyNonCloneableClass;
            m: Map<string, number>;
        };

        const myStruct: TMyStruct = {
            a: 1,
            b: [2, 3, 4],
            c: {
                a: 1,
                b: [2, 3, 4],
            },
            d: [
                {
                    b: [2, 3, 4],
                    c: {
                        d: [{ a: 1 }, { a: 2 }],
                    },
                },
            ],
            f: new MyNonCloneableClass(),
            m: new Map([
                ['a', 1],
                ['b', 2],
            ]),
        };

        const getHash1 = (value: TMyStruct) =>
            semanticHash.get(value, {
                b: { '.toSorted': (a, b) => a - b },
                c: {
                    b: { '.toSorted': (a, b) => a - b },
                },
                d: {
                    '.toSorted': (a, b) => a.b.length - b.c.d.length,
                    b: { '.toSorted': (a, b) => a - b },
                    c: {
                        d: {
                            '.toSorted': (a, b) => a.a - b.a,
                        },
                    },
                },
                f: {
                    '.toStructurallyCloneable': (value) => ({
                        hello: value.hello,
                    }),
                },
                m: {
                    '.toHash': (value) => [...value.entries()].join(''),
                },
            });

        const getHash2 = (value: TMyStruct) =>
            semanticHash.get(value, {
                b: { '.toSorted': (a, b) => b - a }, // <-- changed
                c: {
                    b: { '.toSorted': (a, b) => a - b },
                },
                d: {
                    '.toSorted': (a, b) => a.b.length - b.c.d.length,
                    b: { '.toSorted': (a, b) => a - b },
                    c: {
                        d: {
                            '.toSorted': (a, b) => a.a - b.a,
                        },
                    },
                },
                f: {
                    '.toStructurallyCloneable': (value) => ({
                        hello: value.hello,
                    }),
                },
                m: {
                    '.toHash': (value) => [...value.entries()].join(''),
                },
            });

        const getHash3 = (value: TMyStruct) =>
            semanticHash.get(value, {
                b: { '.toSorted': (a, b) => b - a },
                c: {
                    b: { '.toSorted': (a, b) => a - b },
                },
                d: {
                    '.toSorted': null, // <-- changed
                    b: { '.toSorted': (a, b) => a - b },
                    c: {
                        d: {
                            '.toSorted': (a, b) => a.a - b.a,
                        },
                    },
                },
                f: {
                    '.toStructurallyCloneable': (value) => ({
                        hello: value.hello,
                    }),
                },
                m: {
                    '.toHash': (value) => [...value.entries()].join(''),
                },
            });

        it('Deterministic result', () => {
            const hash = '4ec2a330';
            expect(getHash1(myStruct)).toBe(hash);
            expect(getHash1({ ...myStruct })).toBe(hash);
        });

        it('With a different sort', () => {
            expect(getHash1(myStruct) === getHash2(myStruct)).toBeFalsy();
        });

        it('Without a sort', () => {
            expect(getHash1(myStruct) === getHash3(myStruct)).toBeFalsy();
        });

        it('nullable equality', () => {
            const hash0 = semanticHash.get({ a: null }, {});
            const hash1 = semanticHash.get({ a: undefined }, {});
            const hash2 = semanticHash.get({ a: null }, { a: semanticHash.withNullable() });
            const hash3 = semanticHash.get({ a: {} }, { a: semanticHash.withNullable() });
            const hash4 = semanticHash.get({ a: 5 }, { a: semanticHash.withNullable(isEmpty) });
            const hash5 = semanticHash.get({ a: {} }, { a: semanticHash.withNullable(isEmpty) });
            const hash6 = semanticHash.get(
                { a: { b: { c: { x: undefined, z: undefined } } } },
                {
                    a: semanticHash.withNullable(isDeepObjectEmpty),
                },
            );

            expect(hash0).toBe('ffc5dd4c');
            expect(hash1).toBe('7c2b2bb2');
            expect(hash2).toBe('7c2b2bb2');
            expect(hash3).toBe('7c2b2bb2');
            expect(hash4).toBe('7c2b2bb2');
            expect(hash5).toBe('7c2b2bb2');
            expect(hash6).toBe('7c2b2bb2');
        });

        it('nullable with hash', () => {
            const hash1 = semanticHash.get(
                { a: { b: { c: { x: undefined, z: undefined } } } },
                {
                    a: {
                        ...semanticHash.withNullable(isDeepObjectEmpty),
                        ...semanticHash.withHasher<object>((props) => semanticHash.get(props, {})),
                    },
                },
            );
            const hash2 = semanticHash.get(
                { a: { b: { c: { x: undefined, z: 5 } } } },
                {
                    a: {
                        ...semanticHash.withNullable(isDeepObjectEmpty),
                        ...semanticHash.withHasher<object>((props) => semanticHash.get(props, {})),
                    },
                },
            );

            expect(hash1).toBe('7c2b2bb2');
            expect(hash2).toBe('4db483aa');
        });
    });
});

semanticHash.withHasher(getSocketUrlHash);
