import type { Nil } from '@common/types';
import type { THerodotusPreRiskData } from '@frontend/common/src/modules/actions/herodotus/ModuleGetHerodotusPreRiskData.ts';
import type { TAsset } from '@frontend/common/src/types/domain/asset.ts';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import BigDecimal from 'js-big-decimal';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { formatUnitsLots } from '../../utils/formatters.ts';

export function useDisplayMaxOrderAmount(
    instrument: TInstrument | undefined,
    preRisk: TValueDescriptor2<Nil | THerodotusPreRiskData> | undefined,
    asset: TAsset,
) {
    return useMemo(() => {
        if (
            isNil(instrument) ||
            isNil(preRisk) ||
            !isSyncedValueDescriptor(preRisk) ||
            isNil(preRisk.value)
        ) {
            return undefined;
        }

        const lots = new BigDecimal(preRisk.value.maxOrderAmount);
        const units = lots.multiply(new BigDecimal(instrument.amountNotation.multiplier));

        return formatUnitsLots(units, lots, asset.name);
    }, [asset.name, instrument, preRisk]);
}
