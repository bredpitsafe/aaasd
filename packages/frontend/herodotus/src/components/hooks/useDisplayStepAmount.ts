import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import BigDecimal from 'js-big-decimal';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { formatUnitsLots } from '../../utils/formatters';

export function useDisplayStepAmount(instrument: TInstrument | undefined, asset: TAsset) {
    return useMemo(() => {
        if (isNil(instrument)) {
            return undefined;
        }

        const stepAmountUnits = new BigDecimal(instrument.stepQty.value).multiply(
            new BigDecimal(instrument.amountNotation.multiplier),
        );

        return formatUnitsLots(stepAmountUnits, undefined, asset.name);
    }, [instrument, asset.name]);
}
