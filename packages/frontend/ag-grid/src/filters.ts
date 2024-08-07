import type { ColDef } from '../index';
import { EColumnFilterType } from './types';

/**
 * @public
 */
export const FLOATING_TEXT_FILTER: Pick<
    ColDef,
    'floatingFilter' | 'floatingFilterComponentParams' | 'filter'
> = {
    floatingFilter: true,
    floatingFilterComponentParams: { suppressFilterButton: true },
    filter: EColumnFilterType.text,
};

/**
 * @public
 */
export const FLOATING_NUMBER_FILTER: Pick<
    ColDef,
    'floatingFilter' | 'floatingFilterComponentParams' | 'filter'
> = {
    floatingFilter: true,
    filter: EColumnFilterType.number,
};

/**
 * @public
 */
export const FLOATING_SET_FILTER: Pick<ColDef, 'floatingFilter' | 'filter'> = {
    floatingFilter: true,
    filter: EColumnFilterType.set,
};

/**
 * @public
 */
export const BOOLEAN_FILTER_VALUES: { values: boolean[] } = { values: [true, false] };
