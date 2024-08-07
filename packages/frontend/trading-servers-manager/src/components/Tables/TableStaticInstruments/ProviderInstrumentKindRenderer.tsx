import type { TProviderInstrumentDetails } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { kindToDisplayKind } from '@frontend/common/src/utils/instruments/converters.ts';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { cnEnumValue } from '../view.css.ts';

export const ProviderInstrumentKindRenderer = memo(
    forwardRef(
        (
            {
                value,
            }: ICellRendererParams<Exclude<TProviderInstrumentDetails['kind'], undefined>['type']>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            if (isNil(value)) {
                return null;
            }

            return (
                <span ref={ref} className={cn(cnEnumValue)}>
                    {kindToDisplayKind(value)}
                </span>
            );
        },
    ),
);
