import type {
    TStrategyName,
    TWithStrategyName,
} from '@frontend/common/src/types/domain/ownTrades.ts';
import { isEmpty, isNil } from 'lodash-es';

export const filterExcludedStrategiesFromData = <T extends TWithStrategyName>(
    data: T[],
    excludedStrategies?: TStrategyName[],
): T[] => {
    return !isNil(excludedStrategies) && !isEmpty(excludedStrategies)
        ? data.filter((stat) => !excludedStrategies.includes(stat.strategy))
        : data;
};
