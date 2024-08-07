import type { ICellRendererParams } from '@frontend/ag-grid';
import cn from 'classnames';
import type { Properties } from 'csstype';
import { isEmpty, isNil, isUndefined } from 'lodash-es';
import { memo, useMemo } from 'react';

import { Tooltip } from '../Tooltip';
import type { TCellKey, TRow, TRowCell, TRowCells } from './hooks/defs';
import { cnLegendContainer, cnLegendIndicator, cnLegendIndicatorText } from './renderer.css';

type TCellComponentProps = {
    className?: string;
    text?: string;
    markStyle?: Properties;
};

const DefaultMarkStyle: Properties = {
    backgroundColor: '#00FFAA',
    width: '6px',
    height: '6px',
};

export const HtmlCellComponent = memo(
    ({ className, text = '', markStyle }: TCellComponentProps) => {
        const indicatorStyle: Properties | undefined = useMemo(() => {
            if (isNil(markStyle)) {
                return undefined;
            }

            return {
                ...DefaultMarkStyle,
                backgroundColor: markStyle.color,
                ...markStyle,
            };
        }, [markStyle]);

        if (isUndefined(markStyle)) {
            return <span>{text}</span>;
        }

        return (
            <span className={cn(cnLegendContainer, className)}>
                <span className={cnLegendIndicator} style={indicatorStyle} />
                <span className={cnLegendIndicatorText}>{text}</span>
            </span>
        );
    },
);

export const TableCellRenderer = memo(
    ({ data, colDef }: Omit<ICellRendererParams<TRow, TRowCells>, 'value' | 'valueFormatted'>) => {
        if (isNil(colDef) || isNil(colDef.field)) {
            return null;
        }

        const cellData: TRowCell | undefined = data?.[colDef.field as TCellKey];

        if (isNil(cellData)) {
            return null;
        }

        const element = (
            <HtmlCellComponent text={cellData.formattedValue} markStyle={cellData.markerStyle} />
        );

        return isEmpty(cellData.tooltip) ? (
            element
        ) : (
            <Tooltip mouseEnterDelay={0.5} title={cellData.tooltip}>
                <>{element}</>
            </Tooltip>
        );
    },
);
