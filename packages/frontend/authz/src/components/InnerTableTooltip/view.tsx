import type { ColDef } from '@frontend/ag-grid';
import { AgTable } from '@frontend/common/src/components/AgTable/AgTable';
import { AG_THEME_DARK, AG_THEME_LIGHT } from '@frontend/common/src/components/AgTable/styles';
import type { TooltipProps } from '@frontend/common/src/components/Tooltip';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import cn from 'classnames';
import type { ReactElement } from 'react';

import { cnTooltip, cnTooltipContent, cnTooltipTitle } from './view.css';

enum ETooltipTheme {
    Dark = 'dark',
    Light = 'light',
}

export type TInnerTableProps<T> = {
    rowKey: keyof T;
    data: T[];
    theme?: ETooltipTheme;
    columns: ColDef<T>[];
};

export function InnerTableTooltip<T>({
    rowKey,
    data,
    columns,
    theme = ETooltipTheme.Dark,
    className,
    ...tooltipProps
}: TInnerTableProps<T> & TooltipProps): ReactElement {
    const dataLength = data?.length || 0;

    if (dataLength === 0) {
        return <></>;
    }

    const themeClassName = theme === ETooltipTheme.Light ? AG_THEME_LIGHT : AG_THEME_DARK;

    const shouldSHowScroll = dataLength > 20;

    return (
        <Tooltip
            title={
                <AgTable
                    rowKey={rowKey}
                    rowData={data}
                    columnDefs={columns}
                    className={cn(themeClassName, cnTooltipTitle)}
                    suppressColumnVirtualisation
                    suppressRowVirtualisation
                    domLayout={shouldSHowScroll ? 'normal' : 'autoHeight'}
                />
            }
            overlayInnerStyle={shouldSHowScroll ? { height: '500px' } : undefined}
            overlayClassName={cn(cnTooltip, className)}
            autoAdjustOverflow
            destroyTooltipOnHide
            zIndex={1000}
            mouseLeaveDelay={0.5}
            color={theme === ETooltipTheme.Light ? 'white' : undefined}
            placement="right"
            {...tooltipProps}
        >
            <span className={cnTooltipContent}>{dataLength}</span>
        </Tooltip>
    );
}
