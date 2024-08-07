import { isNil } from 'lodash-es';
import type { RefObject } from 'react';
import { useLayoutEffect } from 'react';

import { getContainerHeight, getContentPartsMeasures } from '../utils';

export function useSetInitialPosition(
    containerRef: RefObject<HTMLDivElement>,
    contentRef: RefObject<HTMLDivElement>,
    midPriceRef: RefObject<HTMLDivElement>,
    midToWindowTopDiff: number | undefined,
    onSetMidToWindowTopDiff: (midPosition: number) => void,
) {
    useLayoutEffect(() => {
        if (!isNil(midToWindowTopDiff)) {
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

        const halfViewportHeight = (containerHeight - midPriceHeight) / 2;

        if (
            (halfViewportHeight >= asksBlockHeight && halfViewportHeight >= bidsBlockHeight) ||
            (halfViewportHeight < asksBlockHeight && halfViewportHeight < bidsBlockHeight)
        ) {
            onSetMidToWindowTopDiff(-halfViewportHeight);
        } else if (asksBlockHeight > bidsBlockHeight) {
            onSetMidToWindowTopDiff(asksBlockHeight + midPriceHeight - containerHeight);
        } else {
            onSetMidToWindowTopDiff(-asksBlockHeight);
        }
    }, [containerRef, contentRef, midPriceRef, midToWindowTopDiff, onSetMidToWindowTopDiff]);
}
