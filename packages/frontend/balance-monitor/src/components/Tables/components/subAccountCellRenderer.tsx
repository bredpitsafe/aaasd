import { red } from '@ant-design/colors';
import type { ICellRendererParams, ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { Tag } from '@frontend/common/src/components/Tag';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import type {
    TBalanceMonitorSubAccountId,
    TBalanceMonitorSubAccountSectionId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

type TSubAccountCellValue = AgValue<
    TBalanceMonitorSubAccountId,
    {
        section: TBalanceMonitorSubAccountSectionId;
    }
>;

export function createSubAccountCellValueGetter<T>(
    getAccount: (data: T) => {
        account: TBalanceMonitorSubAccountId;
        section: TBalanceMonitorSubAccountSectionId;
    },
) {
    return ({ data }: ValueGetterParams<T>) => {
        if (isNil(data)) return null;
        const cellData = getAccount(data);
        return AgValue.create(cellData.account, cellData);
    };
}

export const SubAccountCellRenderer = memo(
    forwardRef(
        (props: ICellRendererParams<TSubAccountCellValue>, ref: ForwardedRef<HTMLElement>) => {
            const value = props.value?.payload;
            const section = props.value?.data.section;

            if (isNil(value)) {
                return (
                    <Tooltip title="Cannot find sub account ID" color={red[6]}>
                        <Tag color="red" ref={ref}>
                            Error
                        </Tag>
                    </Tooltip>
                );
            }

            return (
                <span ref={ref}>
                    <strong>{value}</strong> / {section}
                </span>
            );
        },
    ),
);
