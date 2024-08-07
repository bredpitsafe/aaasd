import { isNil } from 'lodash-es';
import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import { getContainerHeight } from '../utils';

export function useHandleResize(
    containerRef: RefObject<HTMLDivElement>,
    midToWindowTopDiff: number | undefined,
    onSetMidToWindowTopDiff: (midPosition: number) => void,
) {
    const containerHeightRef = useRef(0);

    const onResizeContainer = useFunction(() => {
        const oldHeight = containerHeightRef.current;
        const newHeight = getContainerHeight(containerRef.current!);
        containerHeightRef.current = newHeight;

        if (!isNil(midToWindowTopDiff)) {
            onSetMidToWindowTopDiff(midToWindowTopDiff + (oldHeight - newHeight) / 2);
        }
    });

    useLayoutEffect(() => {
        const containerElement = containerRef.current;

        if (isNil(containerElement)) {
            return;
        }

        const resizeObserver = new ResizeObserver(onResizeContainer);

        resizeObserver.observe(containerElement);

        containerHeightRef.current = getContainerHeight(containerElement);

        return () => void resizeObserver.disconnect();
    }, [containerRef, onResizeContainer]);
}
