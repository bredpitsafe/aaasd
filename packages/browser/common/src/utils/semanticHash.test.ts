import { EMPTY_OBJECT } from './const';
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
            const hash = getHash1(myStruct);
            expect(getHash1(myStruct)).toBe(hash);
            expect(getHash1({ ...myStruct })).toBe(hash);
        });

        it('With a different sort', () => {
            expect(getHash1(myStruct) === getHash2(myStruct)).toBeFalsy();
        });

        it('Without a sort', () => {
            expect(getHash1(myStruct) === getHash3(myStruct)).toBeFalsy();
        });
    });
});
