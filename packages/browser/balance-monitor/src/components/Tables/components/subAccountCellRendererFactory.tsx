import { red } from '@ant-design/colors';
import { Tag } from '@frontend/common/src/components/Tag';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import type { KeyByType } from '@frontend/common/src/types';
import type {
    TBalanceMonitorSubAccountId,
    TBalanceMonitorSubAccountSectionId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ICellRendererParams } from 'ag-grid-community';
import { get, isNil } from 'lodash-es';
import React, { ForwardedRef, forwardRef, memo } from 'react';

export function subAccountCellRendererFactory<
    T,
    TKey1 extends keyof T,
    TKey2 extends KeyByType<T[TKey1], TBalanceMonitorSubAccountSectionId>,
>(path1: TKey1, path2: TKey2): React.FC<ICellRendererParams<T, TBalanceMonitorSubAccountId>>;
export function subAccountCellRendererFactory<T>(
    exchangePath: KeyByType<T, TBalanceMonitorSubAccountSectionId>,
): React.FC<ICellRendererParams<T, TBalanceMonitorSubAccountId>>;
export function subAccountCellRendererFactory<T>(
    ...sectionPath: string[]
): React.FC<ICellRendererParams<T, TBalanceMonitorSubAccountId>> {
    return memo(
        forwardRef(
            (
                props: ICellRendererParams<T, TBalanceMonitorSubAccountId>,
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

                const section = get(props.data, sectionPath) as
                    | TBalanceMonitorSubAccountSectionId
                    | undefined;

                return (
                    <span ref={ref}>
                        <strong>{props.value}</strong> / {section}
                    </span>
                );
            },
        ),
    );
}
