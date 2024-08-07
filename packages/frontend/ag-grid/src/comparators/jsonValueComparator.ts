import { lowerCaseComparator } from './lowerCaseComparator';

export const jsonValueComparator = (a: unknown, b: unknown): number => {
    const aStr = a !== null ? JSON.stringify(a) : '';
    const bStr = b !== null ? JSON.stringify(b) : '';

    return lowerCaseComparator(aStr, bStr);
};
