export const lowerCaseComparator = (a: unknown, b: unknown) => {
    if (typeof a === 'string' && typeof b === 'string') {
        return a.toLowerCase().localeCompare(b.toLowerCase(), undefined, { numeric: true });
    }

    // @ts-ignore
    return a > b ? 1 : a < b ? -1 : 0;
};
