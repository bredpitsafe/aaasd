import type { TPromql, TPromqlQuery } from './Promql';
import { Promql } from './Promql';

const brokenQueries = [
    '{}',
    'a{}',
    "{a='1'}",
    'a{a}',
    "a{='1'}",
    "a{,a='1}",
    "a{a='1',}",
    "'a'",
    "{a='1''}",
    "{a='1\"'}",
    "{'a'='1\"'}",
];
const queryAndData: [string, TPromql][] = [
    [
        'a',
        {
            name: 'a',
            labels: {},
        },
    ],
    [
        "a{a='1'}",
        {
            name: 'a',
            labels: { a: '1' },
        },
    ],
    [
        "b{a='1',b='2'}",
        {
            name: 'b',
            labels: { a: '1', b: '2' },
        },
    ],
];

describe('Promql', () => {
    it.each(brokenQueries)('throw on broken queries', (q) => {
        expect(() => Promql.parseQuery(q as TPromqlQuery)).toThrow();
    });

    it.each(brokenQueries)(`don't throw on broken queries`, (q) => {
        expect(() => Promql.tryParseQuery(q as TPromqlQuery)).not.toThrow();
    });

    it.each(queryAndData)('parsePromql/createQuery', (q, d) => {
        const parsedData = Promql.parseQuery(q as TPromqlQuery);

        expect(parsedData).toEqual(d);

        const query = Promql.createQuery(parsedData.name, parsedData.labels);

        expect(query).toEqual(q);
    });

    const extender = { c: '3' };
    it.each(queryAndData)('upsertQueryLabels', (q, d) => {
        const extendedQuery = Promql.upsertQueryLabels(q as TPromqlQuery, extender);
        const extendedData = Promql.parseQuery(extendedQuery);

        expect(extendedData).toEqual({
            name: d.name,
            labels: Object.assign({}, d.labels, extender),
        });
    });
});
