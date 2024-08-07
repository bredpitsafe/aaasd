import type { TInstrumentDynamicDataStatus } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TWithClassname } from '@frontend/common/src/types/components.ts';
import { dynamicDataStatusToDisplayStatus } from '@frontend/common/src/utils/instruments/converters.ts';
import cn from 'classnames';
import { memo } from 'react';

import { cnEnumValue, cnStatusStyles } from './view.css.ts';

const ERROR_STATUSES = new Set<TInstrumentDynamicDataStatus>([
    'STATUS_HALTED',
    'STATUS_DELISTED',
    'STATUS_FORBIDDEN',
]);
const SUCCESS_STATUSES = new Set<TInstrumentDynamicDataStatus>(['STATUS_TRADING']);

export const DynamicDataStatus = memo(
    ({ className, status }: TWithClassname & { status: TInstrumentDynamicDataStatus }) => {
        return (
            <span
                className={cn(
                    cnEnumValue,
                    {
                        [cnStatusStyles.error]: ERROR_STATUSES.has(status),
                        [cnStatusStyles.succeeded]: SUCCESS_STATUSES.has(status),
                        [cnStatusStyles.normal]:
                            !ERROR_STATUSES.has(status) && !SUCCESS_STATUSES.has(status),
                    },
                    className,
                )}
            >
                {dynamicDataStatusToDisplayStatus(status)}
            </span>
        );
    },
);
