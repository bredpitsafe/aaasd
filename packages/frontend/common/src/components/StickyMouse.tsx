import { ForwardedRef, forwardRef, ReactElement, RefCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUpdate } from 'react-use';

import type { TWithChildren, TWithClassname, TWithStyle } from '../types/components';
import { frameTasks } from '../utils/TasksScheduler/frameTasks';

export const StickyMouse = forwardRef(
    (
        props: TWithChildren &
            TWithStyle &
            TWithClassname & {
                offsetX?: number;
                offsetY?: number;
                initialMouseX?: number;
                initialMouseY?: number;
            },
        ref: ForwardedRef<HTMLElement>,
    ): ReactElement | null => {
        const update = useUpdate();
        const coordsRef = useRef({ x: props.initialMouseX ?? 0, y: props.initialMouseY ?? 0 });

        useEffect(() => {
            const callback = ({ clientX, clientY }: MouseEvent): void => {
                coordsRef.current.x = clientX;
                coordsRef.current.y = clientY;
            };
            const deleteInterval = frameTasks.addInterval(update, 1);
            window.addEventListener('mousemove', callback, { passive: true });

            return () => {
                deleteInterval();
                window.removeEventListener('mousemove', callback);
            };
        }, [update]);

        return coordsRef.current.x === 0 && coordsRef.current.y === 0
            ? null
            : createPortal(
                  <div
                      ref={ref as RefCallback<HTMLElement>}
                      className={props.className}
                      style={{
                          position: 'fixed',
                          top: coordsRef.current.y + (props.offsetY || 0),
                          left: coordsRef.current.x + (props.offsetX || 0),
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
