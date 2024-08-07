import type { TWithClassname } from '@frontend/common/src/types/components';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { cnInstrumentInfoLabel } from './style.css';

export const DisplayAmount = memo(
    ({
        className,
        labelText,
        value,
    }: TWithClassname & {
        labelText: string;
        value: undefined | string;
    }) =>
        isNil(value) ? null : (
            <div className={className}>
                <span className={cnInstrumentInfoLabel}>{labelText}: </span>
                <span>{value}</span>
            </div>
        ),
);
