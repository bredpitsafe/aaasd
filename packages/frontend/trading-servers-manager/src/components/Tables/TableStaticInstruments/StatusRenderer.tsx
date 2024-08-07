import type { TInstrumentApprovalStatus } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { ApprovalStatus } from '../ApprovalStatus.tsx';

export const StatusRenderer = memo(({ value }: ICellRendererParams<TInstrumentApprovalStatus>) => {
    if (isNil(value)) {
        return null;
    }

    return <ApprovalStatus approvalStatus={value} />;
});
