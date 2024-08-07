import type BigDecimal from 'js-big-decimal';
import { isNil } from 'lodash-es';

function formatBigDecimal(decimal: BigDecimal): string {
    const display = decimal.getValue();

    if (!/[.,]/.test(display)) {
        return display;
    }

    return display.replace(/\.?0+$/, '');
}

export function formatUnitsLots(
    units: BigDecimal,
    lots: undefined | BigDecimal,
    baseAssetName: string,
): string {
    const displayUnits = `${formatBigDecimal(units)} ${baseAssetName}`;

    if (isNil(lots) || lots.compareTo(units) === 0) {
        return displayUnits;
    }

    return `${formatBigDecimal(lots)} Lots (${displayUnits})`;
}
