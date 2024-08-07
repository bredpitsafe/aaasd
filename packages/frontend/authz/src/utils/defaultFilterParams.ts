import { isEmpty, isNil } from 'lodash-es';

export enum EFilterOptions {
    Contains = 'contains',
}

export const ARRAY_FILTER_OPTIONS = [
    'contains',
    'notContains',
    'equals',
    'notEqual',
    {
        displayKey: 'notBlank',
        displayName: 'Not Blank',
        predicate: (_: unknown, v: unknown[]) => {
            if (isEmpty(v) || isNil(v)) {
                return false;
            }
            return true;
        },
        numberOfInputs: 0,
    },
    {
        displayKey: 'blank',
        displayName: 'Blank',
        predicate: (_: unknown, v: unknown[]) => {
            if (isEmpty(v) || isNil(v)) {
                return true;
            }
            return false;
        },
        numberOfInputs: 0,
    },
];
