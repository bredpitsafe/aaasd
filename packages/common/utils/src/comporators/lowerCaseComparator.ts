export const lowerCaseComparator = (a: string, b: string) => {
    return a.toLowerCase().localeCompare(b.toLowerCase(), undefined, { numeric: true });
};
