import {
    EInternalTransfersTabSelectors,
    InternalTransfersTabTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/internal-transfers/internal-transfers.tab.selectors';
import {
    EManualTransferTabSelectors,
    ManualTransferTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/manual-transfer/manual-transfer.tab.selectors';
import { InputNumber } from '@frontend/common/src/components/InputNumber';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { KeyboardEvent } from 'react';
import { memo } from 'react';

export const ReadonlyInputNumber = memo(
    ({
        className,
        placeholder,
        min,
        disabled,
        onChange,
    }: TWithClassname & {
        placeholder?: string;
        disabled?: boolean;
        min?: number;
        onChange: (value: number | null) => void;
    }) => {
        const cbKeyDown = useFunction((event: KeyboardEvent<HTMLInputElement>) => {
            switch (event.key) {
                case 'Enter':
                    const value = parseFloat((event.target as HTMLInputElement).value);
                    if (!isFinite(value) || isNaN(value) || value <= 0) {
                        onChange(null);
                        event.preventDefault();
                    } else {
                        onChange(value);
                    }
                    break;
                case 'Escape':
                    (event.target as HTMLInputElement).blur();
                    event.preventDefault();
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    event.stopPropagation();
                    event.preventDefault();
                    break;
                default:
                    break;
            }
        });

        return (
            <InputNumber<number>
                {...ManualTransferTabProps[EManualTransferTabSelectors.PercentInput]}
                {...InternalTransfersTabTabProps[EInternalTransfersTabSelectors.PercentInput]}
                className={className}
                placeholder={placeholder}
                value={null}
                min={min}
                disabled={disabled}
                onChange={onChange}
                onKeyDown={cbKeyDown}
                controls={false}
            />
        );
    },
);
