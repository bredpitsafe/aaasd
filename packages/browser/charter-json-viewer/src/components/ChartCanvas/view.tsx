import { createTestProps } from '@frontend/common/e2e';
import { ECharterJsonViewerSelectors } from '@frontend/common/e2e/selectors/charter-json-viewer/charter-json-viewer.page.selectors';
import { TWithChildren, TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import {
    ForwardedRef,
    forwardRef,
    MouseEventHandler,
    ReactElement,
    useEffect,
    useRef,
} from 'react';
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
            const node = rootRef.current;
            node?.appendChild(props.view);

            return () => {
                node?.removeChild(props.view);
            };
        }, [props.view]);

        return (
            <div
                {...createTestProps(ECharterJsonViewerSelectors.ChartCanvasView)}
                ref={mergeRefs([rootRef, ref])}
                className={cn(cnRoot, props.className)}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
                draggable={false}
            />
        );
    },
);
