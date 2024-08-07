import type {
    TInstrumentDynamicData,
    TInstrumentDynamicDataPriceStepRules,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { DynamicDataStepPrice } from '../DynamicDataStepPrice.tsx';

export const StepPriceRenderer = memo(
    ({
        value,
    }: ICellRendererParams<TInstrumentDynamicDataPriceStepRules, TInstrumentDynamicData>) => {
        if (isNil(value)) {
            return null;
        }

        return <DynamicDataStepPrice priceStepRules={value} />;
    },
);
