import cn from 'classnames';
import type { Properties } from 'csstype';
import { isNil, isUndefined } from 'lodash-es';
import { memo, useMemo } from 'react';

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
