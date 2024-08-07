import { isNil } from 'lodash-es';
import type { ForwardedRef, ReactElement, RefCallback, RefObject } from 'react';
import { forwardRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

import type { TWithChildren, TWithClassname, TWithStyle } from '../types/components';

export const StickyElement = forwardRef(
    (
        props: TWithChildren &
            TWithStyle &
            TWithClassname & {
                elementRef: RefObject<HTMLElement>;
                offsetX?: number;
                offsetY?: number;
            },
        ref: ForwardedRef<HTMLElement>,
    ): ReactElement | null => {
        const bb = useMemo(
            () => props.elementRef.current?.getBoundingClientRect(),
            [props.elementRef],
        );

        return isNil(bb)
            ? null
            : createPortal(
                  <div
                      ref={ref as RefCallback<HTMLElement>}
                      className={props.className}
                      style={{
                          position: 'fixed',
                          top: bb.top + (props.offsetY || 0),
                          left: bb.left + (props.offsetX || 0),
                          width: 1,
                          height: 1,
                          ...props.style,
                      }}
                  >
                      {props.children}
                  </div>,
                  document.body,
              );
    },
);
