import type { TWithChildren, TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import type { ForwardedRef, MouseEventHandler, ReactElement } from 'react';
import { forwardRef, useEffect, useRef } from 'react';
import mergeRefs from 'react-merge-refs';

import { cnRoot } from './view.css';

type ChartViewProps = TWithChildren &
    TWithClassname & {
        view: HTMLElement;
        onMouseEnter?: MouseEventHandler;
        onMouseLeave?: MouseEventHandler;
    };
export const ChartCanvasView = forwardRef(
    (props: ChartViewProps, ref: ForwardedRef<HTMLDivElement>): ReactElement => {
        const rootRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            rootRef.current?.appendChild(props.view);

            return () => {
                props.view.remove();
            };
        }, [props.view]);

        return (
            <div
                ref={mergeRefs([rootRef, ref])}
                className={cn(cnRoot, props.className)}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
                draggable={false}
            />
        );
    },
);
