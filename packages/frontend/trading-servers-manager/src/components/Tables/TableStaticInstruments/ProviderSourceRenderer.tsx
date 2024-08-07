import type { TProviderInstrumentSource } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { logger } from '@frontend/common/src/utils/Tracing';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { cnEnumValue } from '../view.css.ts';

export const ProviderSourceRenderer = memo(
    forwardRef(
        (
            { value }: ICellRendererParams<TProviderInstrumentSource>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            if (isNil(value)) {
                return null;
            }

            return (
                <span ref={ref} className={cn(cnEnumValue)}>
                    {statusToDisplayStatus(value)}
                </span>
            );
        },
    ),
);

function statusToDisplayStatus(value: TProviderInstrumentSource): string {
    switch (value) {
        case 'SOURCE_UNSPECIFIED':
            return 'Unspecified';
        case 'SOURCE_TRANSFORMED':
            return 'Transformed';
        case 'SOURCE_OVERRIDE':
            return 'Override';
        default:
            logger.error(`Unknown source "${value}"`);
            return value;
    }
}
