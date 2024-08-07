import type { GridApi } from '@frontend/ag-grid';
import { Events } from '@frontend/ag-grid';
import { useEffect, useRef } from 'react';

export type TUseScrollCallbacksProps = {
    onScroll?: () => void;
    onTouchTop?: () => void;
    onUnTouchTop?: () => void;
};

export function useScrollCallbacks(
    gridApi: undefined | GridApi,
    props: TUseScrollCallbacksProps,
): void {
    const touchingTop = useRef(false);

    useEffect(() => {
        if (gridApi === undefined || props.onScroll === undefined) return;

        gridApi.addEventListener(Events.EVENT_BODY_SCROLL, props.onScroll);

        return () => gridApi.removeEventListener(Events.EVENT_BODY_SCROLL, props.onScroll!);
    }, [gridApi, props.onScroll]);

    const { onTouchTop, onUnTouchTop } = props;
    useEffect(() => {
        if (gridApi === undefined || (onTouchTop === undefined && onUnTouchTop === undefined)) {
            return;
        }

        const onEnd = (event: { top: number }) => {
            if (event.top <= 0 && !touchingTop.current) {
                touchingTop.current = true;
                onTouchTop?.();
            }
            if (event.top > 0 && touchingTop.current) {
                touchingTop.current = false;
                onUnTouchTop?.();
            }
        };

        gridApi.addEventListener(Events.EVENT_BODY_SCROLL_END, onEnd);

        return () => gridApi.removeEventListener(Events.EVENT_BODY_SCROLL_END, onEnd);
    }, [gridApi, onTouchTop, onUnTouchTop]);
}
