import type { TInstrumentDynamicDataStatus } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { DynamicDataStatus } from '../DynamicDataStatus.tsx';

export const StatusRenderer = memo(
    ({ value }: ICellRendererParams<TInstrumentDynamicDataStatus>) => {
        if (isNil(value)) {
            return null;
        }

        return <DynamicDataStatus status={value} />;
    },
);
