import type { ColDef } from '@frontend/ag-grid';
import type { TooltipProps } from 'antd';
import cn from 'classnames';
import type { ReactElement, ReactNode } from 'react';

import type { TWithClassname } from '../../types/components.ts';
import { AgTable } from '../AgTable/AgTable.tsx';
import { AG_THEME_DARK, AG_THEME_LIGHT } from '../AgTable/styles.ts';
import { Tooltip } from '../Tooltip.tsx';
import { cnTooltip, cnTooltipContent } from './TooltipTable.css.ts';

export enum ETooltipTheme {
    Dark = 'dark',
    Light = 'light',
}

type TTooltipTableProps<T> = {
    items: T[];
    theme: ETooltipTheme;
    content: ReactNode;
    columns: ColDef<T>[];
    rowKey: keyof T;
} & TWithClassname;

export function TooltipTable<T>({
    items,
    theme,
    content,
    columns,
    rowKey,
    className,
    ...tooltipProps
}: TTooltipTableProps<T> & TooltipProps): ReactElement {
    return (
        <Tooltip
            title={
                <TooltipTitle
                    items={items}
                    theme={theme}
                    columns={columns}
                    rowKey={rowKey}
                ></TooltipTitle>
            }
            overlayClassName={cn(cnTooltip, className)}
            destroyTooltipOnHide
            zIndex={1000}
            color={theme === ETooltipTheme.Light ? 'white' : undefined}
            {...tooltipProps}
        >
            <span className={cnTooltipContent}>{content}</span>
        </Tooltip>
    );
}

function TooltipTitle<T>({
    items,
    theme,
    columns,
    rowKey,
}: Omit<TTooltipTableProps<T>, 'content' | 'className'>): ReactElement {
    return (
        <AgTable
            rowKey={rowKey}
            rowData={items}
            columnDefs={columns}
            className={theme === ETooltipTheme.Light ? AG_THEME_LIGHT : AG_THEME_DARK}
            suppressColumnVirtualisation
            suppressRowVirtualisation
            domLayout="autoHeight"
        />
    );
}
