import { isNil } from 'lodash-es';
import type { RefObject } from 'react';
import { useLayoutEffect } from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import { getContainerScrollTop, getFullAsksBlockHeight } from '../utils';

export function useHandleScroll(
    containerRef: RefObject<HTMLDivElement>,
    contentRef: RefObject<HTMLDivElement>,
    midPriceRef: RefObject<HTMLDivElement>,
    midToWindowTopDiff: number | undefined,
    onSetMidToWindowTopDiff: (midPosition: number) => void,
) {
    const onScroll = useFunction(() => {
        if (isNil(midToWindowTopDiff)) {
            return;
        }

        const containerElement = containerRef.current;
        const contentElement = contentRef.current;
        const midPriceElement = midPriceRef.current;

        if (isNil(containerElement) || isNil(contentElement) || isNil(midPriceElement)) {
            return;
        }

        const scrollTop = getContainerScrollTop(containerElement);
        const asksBlockHeight = getFullAsksBlockHeight(containerElement, midPriceElement);
        const newMidToWindowTopDiff = scrollTop - asksBlockHeight;

        if (Math.abs(midToWindowTopDiff - newMidToWindowTopDiff) < 1) {
            // Apply only visible scroll that is at least 1px
            return;
        }

        onSetMidToWindowTopDiff(newMidToWindowTopDiff);
    });

    useLayoutEffect(() => {
        const containerElement = containerRef.current;

        if (isNil(containerElement)) {
            return;
        }

        containerElement.addEventListener('scroll', onScroll, { passive: true });

        return () => containerElement.removeEventListener('scroll', onScroll);
    }, [containerRef, onScroll]);
}
