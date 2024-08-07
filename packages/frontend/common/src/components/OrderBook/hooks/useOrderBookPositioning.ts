import type { RefObject } from 'react';
import { useRef } from 'react';

import { useHandleResize } from './useHandleResize';
import { useHandleScroll } from './useHandleScroll';
import { useSetInitialPosition } from './useSetInitialPosition';
import { useStickToPosition } from './useStickToPosition';

export function useOrderBookPositioning(
    midPriceRef: RefObject<HTMLDivElement>,
    midToWindowTopDiff: number | undefined,
    onSetMidToWindowTopDiff: (midPosition: number) => void,
    topItemsCount: number,
    bottomItemsCount: number,
): {
    containerRef: RefObject<HTMLDivElement>;
    contentRef: RefObject<HTMLDivElement>;
} {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useSetInitialPosition(
        containerRef,
        contentRef,
        midPriceRef,
        midToWindowTopDiff,
        onSetMidToWindowTopDiff,
    );

    useStickToPosition(
        containerRef,
        contentRef,
        midPriceRef,
        midToWindowTopDiff,
        topItemsCount,
        bottomItemsCount,
    );

    useHandleResize(containerRef, midToWindowTopDiff, onSetMidToWindowTopDiff);

    useHandleScroll(
        containerRef,
        contentRef,
        midPriceRef,
        midToWindowTopDiff,
        onSetMidToWindowTopDiff,
    );

    return { containerRef, contentRef };
}
