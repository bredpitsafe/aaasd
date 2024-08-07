import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import type { TAmount, TTransfer } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { cnTooltipText, cnTooltipTitle, cnTooltipValue } from './MinMaxTooltip.css';

export const MinMaxTooltip = memo(
    ({
        currentTransfer,
        onClickNumber,
    }: {
        currentTransfer: TTransfer | undefined;
        onClickNumber: (value: TAmount) => void;
    }) => {
        if (
            isNil(currentTransfer) ||
            (isNil(currentTransfer.minManualTransfer) && isNil(currentTransfer.maxManualTransfer))
        ) {
            return null;
        }

        const min = isNil(currentTransfer.minManualTransfer) ? null : (
            <TooltipRow
                title="Min — "
                value={currentTransfer.minManualTransfer}
                onClick={onClickNumber}
            />
        );

        const max = isNil(currentTransfer.maxManualTransfer) ? null : (
            <TooltipRow
                title="Max — "
                value={currentTransfer.maxManualTransfer}
                onClick={onClickNumber}
            />
        );

        return (
            <Tooltip
                title={
                    <div className={cnTooltipTitle}>
                        {min}
                        {max}
                    </div>
                }
            >
                <InfoCircleOutlined />
            </Tooltip>
        );
    },
);

const TooltipRow = ({
    title,
    value,
    onClick,
}: {
    title: string;
    value: TAmount;
    onClick: (value: TAmount) => void;
}) => {
    const handleClick = useFunction(() => onClick(value));
    return (
        <p className={cnTooltipText}>
            {title}
            {value === 0 ? (
                value
            ) : (
                <span
                    onClick={handleClick}
                    className={cnTooltipValue}
                    title='Click to set "amount" value'
                >
                    {value}
                </span>
            )}
        </p>
    );
};
