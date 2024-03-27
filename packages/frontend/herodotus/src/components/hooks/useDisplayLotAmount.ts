import type { TAsset } from '@frontend/common/src/types/domain/asset.ts';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument.ts';
import BigDecimal from 'js-big-decimal';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { formatUnitsLots } from '../../utils/formatters.ts';

export function useDisplayLotAmount(instrument: TInstrument | undefined, asset: TAsset) {
    return useMemo(() => {
        if (isNil(instrument)) {
            return undefined;
        }

        const lotAmountUnits = new BigDecimal(instrument.amountNotation.multiplier);

        return formatUnitsLots(lotAmountUnits, undefined, asset.name);
    }, [instrument, asset.name]);
}
