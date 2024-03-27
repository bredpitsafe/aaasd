import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { isEmpty, isNil } from 'lodash-es';

const INDICATORS_LIST_SEPARATOR = ',';
const EMPTY_INDICATOR = '';

export function indicatorToIndicatorsList(indicator: string | null): string[] {
    return isNil(indicator) || indicator === EMPTY_INDICATOR
        ? []
        : indicator
              .split(INDICATORS_LIST_SEPARATOR)
              .map((indicator) => indicator.trim())
              .filter((indicator) => !isEmpty(indicator));
}

export function indicatorsListToIndicator(indicatorsList: string[] | undefined): string {
    const list =
        indicatorsList
            ?.map((indicator) => indicator.trim())
            .filter((indicator) => !isEmpty(indicator)) ?? EMPTY_ARRAY;

    return list.length > 0 ? list.join(INDICATORS_LIST_SEPARATOR) : EMPTY_INDICATOR;
}
