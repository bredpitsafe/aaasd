import { red } from '@ant-design/colors';
import { DownOutlined } from '@ant-design/icons';
import type {
    ColumnFunctionCallbackParams,
    ICellRendererParams,
    ValueGetterParams,
} from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { Tag } from '@frontend/common/src/components/Tag';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import type {
    TBalanceMonitorAccountId,
    TExchangeId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isBoolean, isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { AccountWithExchangeIcon } from '../../AccountWithExchangeIcon';
import { cnAccountCellDropdownIcon, cnAccountContainer } from '../style.css';

type TAccountCellValue = AgValue<
    TBalanceMonitorAccountId,
    {
        exchange: TExchangeId;
    }
>;

export function createAccountCellValueGetter<T>(
    getAccount: (data: T) => {
        account: TBalanceMonitorAccountId;
        exchange: TExchangeId;
    },
) {
    return ({ data }: ValueGetterParams<T>) => {
        if (isNil(data)) return null;
        const cellData = getAccount(data);
        return AgValue.create(cellData.account, cellData);
    };
}

export const AccountCellRenderer = memo(
    forwardRef((props: ICellRendererParams<TAccountCellValue>, ref: ForwardedRef<HTMLElement>) => {
        const value = props.value?.payload;
        const exchange = props.value?.data.exchange;

        if (isNil(value)) {
            return (
                <Tooltip title="Cannot find account ID" color={red[6]}>
                    <Tag color="red" ref={ref}>
                        Error
                    </Tag>
                </Tooltip>
            );
        }

        const editable = props.colDef?.editable;
        const isEditable =
            editable === undefined
                ? false
                : isBoolean(editable)
                  ? editable
                  : editable(props as ColumnFunctionCallbackParams<unknown, TAccountCellValue>);

        return (
            <div className={cnAccountContainer}>
                <AccountWithExchangeIcon account={value} exchange={exchange} ref={ref} />
                {isEditable && <DownOutlined className={cnAccountCellDropdownIcon} />}
            </div>
        );
    }),
);
