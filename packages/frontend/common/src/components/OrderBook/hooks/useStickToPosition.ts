import { isNil } from 'lodash-es';
import type { RefObject } from 'react';
import { useLayoutEffect } from 'react';

import { getContainerHeight, getContainerScrollTop, getContentPartsMeasures } from '../utils';

export function useStickToPosition(
    containerRef: RefObject<HTMLDivElement>,
    contentRef: RefObject<HTMLDivElement>,
    midPriceRef: RefObject<HTMLDivElement>,
    midToWindowTopDiff: number | undefined,
    topItemsCount: number,
    bottomItemsCount: number,
) {
    useLayoutEffect(() => {
        if (isNil(midToWindowTopDiff)) {
            return;
        }

        const containerElement = containerRef.current;
        const contentElement = contentRef.current;
        const midPriceElement = midPriceRef.current;

        if (isNil(containerElement) || isNil(contentElement) || isNil(midPriceElement)) {
            return;
        }

        const containerHeight = getContainerHeight(containerElement);
        const { asksBlockHeight, midPriceHeight, bidsBlockHeight } = getContentPartsMeasures(
            containerElement,
            contentElement,
            midPriceElement,
        );

        const windowStart = asksBlockHeight + midToWindowTopDiff;
        const diffEnding = containerHeight + midToWindowTopDiff - midPriceHeight - bidsBlockHeight;

        contentElement.style.marginTop = windowStart < 0 ? `${-windowStart}px` : '';
        contentElement.style.marginBottom = diffEnding > 0 ? `${diffEnding}px` : '';

        const scrollTop = windowStart > 0 ? windowStart : 0;

        if (getContainerScrollTop(containerElement) !== scrollTop) {
            containerElement.scrollTo({ top: scrollTop });
        }
    }, [
        containerRef,
        contentRef,
        midPriceRef,
        midToWindowTopDiff,
        topItemsCount,
        bottomItemsCount,
    ]);
}
