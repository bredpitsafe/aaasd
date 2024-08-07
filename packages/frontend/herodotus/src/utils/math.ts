import type BigDecimal from 'js-big-decimal';
import { isNil } from 'lodash-es';

export function getMainSizeBigDecimal(value: BigDecimal): number {
    const match = value.getValue().match(/^(\d*)([.,]|$)/);

    return match?.[1]?.length ?? 0;
}

export function getPrecisionBigDecimal(value: BigDecimal): number {
    const match = value.getValue().match(/[.,](\d+)$/);

    if (isNil(match) || match[1].length === 0) {
        return 0;
    }

    return match[1].replace(/0+$/, '').length;
}
