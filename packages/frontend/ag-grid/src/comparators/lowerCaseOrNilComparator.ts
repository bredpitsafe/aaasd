import { isNil } from 'lodash-es';

export const lowerCaseOrNilComparator = (a: unknown, b: unknown) => {
    if (isNil(a)) {
        a = '';
    }

    if (isNil(b)) {
        b = '';
    }
    if (typeof a === 'string' && typeof b === 'string') {
        return a.toLowerCase().localeCompare(b.toLowerCase(), undefined, { numeric: true });
    }

    // @ts-ignore
    return a > b ? 1 : a < b ? -1 : 0;
};
