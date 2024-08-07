import { structHash } from './structHash';

type MySubStruct = {
    a: number;
    b: number[];
    c: {
        a: number;
        b: number[];
    };
};

type MyStruct = {
    a: number;
    b: string;
    c: boolean;
    d: {
        a: number;
        b: number[];
        c: MySubStruct[];
    };
    e: MySubStruct[];
};

const myStruct: MyStruct = {
    a: 1,
    b: '2',
    c: true,
    d: {
        a: 1,
        b: [1, 2, 3],
        c: [
            {
                a: 1,
                b: [1, 2, 3],
                c: {
                    a: 1,
                    b: [1, 2, 3],
                },
            },
            {
                a: 1,
                b: [1, 2, 3],
                c: {
                    a: 1,
                    b: [1, 2, 3],
                },
            },
        ],
    },
    e: [
        {
            a: 1,
            b: [1, 2, 3],
            c: {
                a: 1,
                b: [1, 2, 3],
            },
        },
        {
            a: 1,
            b: [1, 2, 3],
            c: {
                a: 1,
                b: [1, 2, 3],
            },
        },
    ],
};

describe('structHash', () => {
    const getSubStructHash = (value: MySubStruct) =>
        structHash(value, {
            b: (value) => [...value].join(','),
            c: (value) =>
                structHash(value, {
                    b: (value) => [...value].sort().join(','),
                }),
        });

    const getStructHash = (struct: MyStruct) =>
        structHash(struct, {
            d: (value) =>
                structHash(value, {
                    b: (value) => [...value].join(','),
                    c: (value) => value.map(getSubStructHash).join(','),
                }),
            e: (value) => value.map(getSubStructHash).join(','),
        });

    const getStructHashWithAnotherSubHash = (struct: MyStruct) =>
        structHash(struct, {
            d: (value) =>
                structHash(value, {
                    b: (value) => [...value].join('/'), // <-- different
                    c: (value) => value.map(getSubStructHash).join(','),
                }),
            e: (value) => value.map(getSubStructHash).join(','),
        });

    const getStructHashWithAnotherOrder = (struct: MyStruct) =>
        structHash(struct, {
            d: (value) =>
                structHash(value, {
                    b: (value) => [...value].sort((a, b) => b - a).join(','), // <-- different
                    c: (value) => value.map(getSubStructHash).join(','),
                }),
            e: (value) => value.map(getSubStructHash).join(','),
        });

    it('Deterministic result', () => {
        const hash = getStructHash(myStruct);
        expect(getStructHash(myStruct)).toBe(hash);
        expect(getStructHash({ ...myStruct })).toBe(hash);
        expect(getStructHash(JSON.parse(JSON.stringify(myStruct)))).toBe(hash);
    });

    it('Different sub hash', () => {
        expect(getStructHash(myStruct) === getStructHashWithAnotherSubHash(myStruct)).toBeFalsy();
    });

    it('Different sub array order', () => {
        expect(getStructHash(myStruct) === getStructHashWithAnotherOrder(myStruct)).toBeFalsy();
    });
});
