import type { Opaque } from '@common/types';
import { assert } from '@common/utils/src/assert.ts';
import { isEmpty } from 'lodash-es';

export type TPromql = {
    name: string;
    labels: Record<string, undefined | string>;
};

export type TPromqlQuery = Opaque<'Promql', string>;

function createQuery(name: TPromql['name'], labels?: TPromql['labels']): TPromqlQuery {
    if (/['"]/g.test(name)) throw new Error('Name can`t contain quotes');

    const labelsStr = labels
        ? Object.entries(labels).reduce((acc, [key, value], index) => {
              if (value === undefined) return acc;
              if (/['"]/g.test(key)) throw new Error('Key can`t contain quotes');
              if (/['"]/g.test(value)) throw new Error('Value can`t contain quotes');

              const comma = index > 0 ? ',' : '';
              const label = `${key}='${value}'`;

              return acc + comma + label;
          }, '{') + '}'
        : '';

    return `${name}${labelsStr === '{}' ? '' : labelsStr}` as TPromqlQuery;
}

function parseQuery(str: TPromqlQuery): TPromql {
    if (str === '') throw new Error('Empty query');

    const index = str.indexOf('{');

    if (index === 0) throw new Error('Empty name');

    const name = index === -1 ? str : str.substring(0, index);

    if (/['"]/g.test(name)) throw new Error('Name can`t contain quotes');

    const labels =
        index === -1 || str === '{}'
            ? {}
            : str
                  .substring(index + 1, str.length - 1)
                  .split(',')
                  .reduce(
                      (acc, keyValue) => {
                          const arr = keyValue.split('=');

                          const key = arr[0].trim();

                          assert(!isEmpty(key), 'Empty label key');
                          assert(!isEmpty(arr[1]), 'Empty label value');

                          const value = arr[1].replace(/^['"]|['"]$/gm, '');

                          assert(!/['"]/g.test(key), 'Key can`t contain quotes');
                          assert(!/['"]/g.test(value), 'Value can`t contain quote');

                          acc[key] = value;

                          return acc;
                      },
                      {} as TPromql['labels'],
                  );

    return {
        name,
        labels,
    };
}

function tryParseQuery(str: TPromqlQuery): TPromql | null {
    try {
        return parseQuery(str);
    } catch (e) {
        return null;
    }
}

function upsertQueryLabels(str: TPromqlQuery, labels: TPromql['labels']): TPromqlQuery {
    const struct = parseQuery(str);
    return createQuery(struct.name, Object.assign(struct.labels, labels));
}

export const Promql = {
    createQuery,
    parseQuery,
    upsertQueryLabels,
    tryParseQuery,
};
