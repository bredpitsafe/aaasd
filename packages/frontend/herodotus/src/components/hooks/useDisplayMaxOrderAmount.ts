import type { THerodotusPreRiskDataReturnType } from '@frontend/common/src/modules/actions/ModuleGetHerodotusPreRiskData.ts';
import type { TAsset } from '@frontend/common/src/types/domain/asset.ts';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument.ts';
import { isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor.ts';
import BigDecimal from 'js-big-decimal';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { formatUnitsLots } from '../../utils/formatters.ts';

export function useDisplayMaxOrderAmount(
    instrument: TInstrument | undefined,
    preRisk: THerodotusPreRiskDataReturnType | undefined,
    asset: TAsset,
) {
    return useMemo(() => {
        if (isNil(instrument) || isNil(preRisk) || !isSyncDesc(preRisk) || isNil(preRisk.value)) {
            return undefined;
        }

        const lots = new BigDecimal(preRisk.value.maxOrderAmount);
        const units = lots.multiply(new BigDecimal(instrument.amountNotation.multiplier));

        return formatUnitsLots(units, lots, asset.name);
    }, [asset.name, instrument, preRisk]);
}
