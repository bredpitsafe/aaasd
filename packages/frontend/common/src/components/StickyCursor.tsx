import { isNil } from 'lodash-es';
import type { ForwardedRef, ReactElement, RefCallback } from 'react';
import { forwardRef } from 'react';
import { createPortal } from 'react-dom';

import type { TWithChildren, TWithClassname, TWithStyle } from '../types/components';

export type IStickyCursorProps = TWithChildren &
    TWithStyle &
    TWithClassname & {
        offsetX?: number;
        offsetY?: number;
        mouseX?: number;
        mouseY?: number;
    };

export const StickyCursor = forwardRef(
    (props: IStickyCursorProps, ref: ForwardedRef<HTMLElement>): ReactElement | null => {
        return isNil(props.mouseX) ||
            isNil(props.mouseY) ||
            (props.mouseX === 0 && props.mouseY === 0)
            ? null
            : createPortal(
                  <div
                      ref={ref as RefCallback<HTMLElement>}
                      className={props.className}
                      style={{
                          position: 'fixed',
                          top: props.mouseY + (props.offsetY || 0),
                          left: props.mouseX + (props.offsetX || 0),
                          ...props.style,
                      }}
                  >
                      {props.children}
                  </div>,
                  document.body,
              );
    },
);
