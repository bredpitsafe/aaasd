import { isNil } from 'lodash-es';
import type { MutableRefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';

import { useFunction } from '../../utils/React/useFunction';

const DEFAULT_SCALE = 1;

export function useContentScaleToParent<T extends HTMLElement>(): MutableRefObject<T> {
    const containerSizeRef = useRef({
        width: 0,
        height: 0,
    });
    const ref = useRef<T>() as MutableRefObject<T>;

    useLayoutEffect(() => {
        if (isNil(ref.current)) {
            return;
        }

        ref.current.style.transformOrigin = 'top left';
        ref.current.style.willChange = 'transform, min-width, min-height';
    }, []);

    const resizeAndScale = useFunction(() => {
        if (
            isNil(ref.current) ||
            containerSizeRef.current.width === 0 ||
            containerSizeRef.current.height === 0
        ) {
            return;
        }

        const requiredWidth = ref.current.scrollWidth;
        const requiredHeight = ref.current.scrollHeight;

        const horizontalScale =
            requiredWidth > 0 ? containerSizeRef.current.width / requiredWidth : DEFAULT_SCALE;
        const verticalScale =
            requiredHeight > 0 ? containerSizeRef.current.height / requiredHeight : DEFAULT_SCALE;

        const scale = Math.min(verticalScale, horizontalScale, DEFAULT_SCALE);
        const width = Math.round(containerSizeRef.current.width / scale);
        const height = Math.round(containerSizeRef.current.height / scale);

        Object.assign(ref.current.style, {
            minWidth: `${width}px`,
            minHeight: `${height}px`,
            transform: `scale(${scale})`,
        });
    });

    const onResizeContainer = useFunction(() => {
        if (isNil(ref.current?.parentElement)) {
            return;
        }

        const computedStyle = window.getComputedStyle(ref.current.parentElement);

        const width = parseInt(computedStyle.getPropertyValue('width'), 10);
        const height = parseInt(computedStyle.getPropertyValue('height'), 10);

        const containerSize = containerSizeRef.current;

        if (width !== containerSize.width || height !== containerSize.height) {
            containerSizeRef.current = { width, height };

            // Allow to apply layout without limitations to measure content
            Object.assign(ref.current.style, { minWidth: 'auto', minHeight: 'auto' });

            resizeAndScale();
        }
    });

    useLayoutEffect(() => {
        if (isNil(ref.current?.parentElement)) {
            return;
        }

        const parent = ref.current.parentElement;

        const resizeObserver = new ResizeObserver(onResizeContainer);

        resizeObserver.observe(parent);

        onResizeContainer();

        return () => void resizeObserver.disconnect();
    }, [ref.current?.parentElement, onResizeContainer]);

    useLayoutEffect(() => {
        if (isNil(ref.current)) {
            return;
        }

        const resizeObserver = new ResizeObserver(resizeAndScale);
        const mutationObserver = new MutationObserver(resizeAndScale);

        resizeObserver.observe(ref.current);
        mutationObserver.observe(ref.current, {
            subtree: true,
            childList: true,
            characterData: true,
        });

        resizeAndScale();

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [resizeAndScale]);

    return ref;
}
