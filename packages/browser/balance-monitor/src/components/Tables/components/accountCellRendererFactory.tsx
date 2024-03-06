import { red } from '@ant-design/colors';
import { DownOutlined } from '@ant-design/icons';
import { Tag } from '@frontend/common/src/components/Tag';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import type { KeyByType } from '@frontend/common/src/types';
import type {
    TBalanceMonitorAccountId,
    TExchangeId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ColumnFunctionCallbackParams, ICellRendererParams } from 'ag-grid-community';
import { get, isBoolean, isNil } from 'lodash-es';
import React, { ForwardedRef, forwardRef, memo } from 'react';

import { AccountWithExchangeIcon } from '../../AccountWithExchangeIcon';
import { cnAccountCellDropdownIcon, cnAccountContainer } from '../style.css';

export function accountCellRendererFactory<
    T,
    TKey1 extends keyof T,
    TKey2 extends KeyByType<T[TKey1], TExchangeId>,
>(path1: TKey1, path2: TKey2): React.FC<ICellRendererParams<T, TBalanceMonitorAccountId>>;
export function accountCellRendererFactory<T>(
    exchangePath: KeyByType<T, TExchangeId>,
): React.FC<ICellRendererParams<T, TBalanceMonitorAccountId>>;
export function accountCellRendererFactory<T>(
    ...exchangePath: string[]
): React.FC<ICellRendererParams<T, TBalanceMonitorAccountId>> {
    return memo(
        forwardRef(
            (
                props: ICellRendererParams<T, TBalanceMonitorAccountId>,
                ref: ForwardedRef<HTMLElement>,
            ) => {
                if (isNil(props.value)) {
                    return (
                        <Tooltip
                            title={`Field: ${
                                props.colDef?.field ?? 'unset'
                            } is missing in ${JSON.stringify(props.data)}`}
                            color={red[6]}
                        >
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
                          : editable(props as ColumnFunctionCallbackParams<T>);

                const exchange = get(props.data, exchangePath) as TExchangeId | undefined;

                return (
                    <div className={cnAccountContainer}>
                        <AccountWithExchangeIcon
                            account={props.value}
                            exchange={exchange}
                            ref={ref}
                        />

                        {isEditable && <DownOutlined className={cnAccountCellDropdownIcon} />}
                    </div>
                );
            },
        ),
    );
}
