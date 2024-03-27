import type { TAsset } from '@frontend/common/src/types/domain/asset.ts';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument.ts';
import BigDecimal from 'js-big-decimal';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { formatUnitsLots } from '../../utils/formatters.ts';

export function useDisplayOrderAmount(
    instrument: TInstrument | undefined,
    orderSize: number | undefined,
    asset: TAsset,
) {
    return useMemo(() => {
        if (isNil(instrument)) {
            return undefined;
        }

        const units = new BigDecimal(orderSize);
        const lots = units.divide(new BigDecimal(instrument.amountNotation.multiplier), undefined);

        return formatUnitsLots(units, lots, asset.name);
    }, [orderSize, instrument, asset.name]);
}
