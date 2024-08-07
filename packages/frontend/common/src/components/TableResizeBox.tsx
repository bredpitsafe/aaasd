import cn from 'classnames';
import type { ReactElement } from 'react';
import type { ResizeCallbackData } from 'react-resizable';
import { useLocalStorage } from 'react-use';

import { useFunction } from '../utils/React/useFunction';
import type { ResizableBoxProps } from './Resizable';
import { ResizableBox } from './Resizable';
import { cnHandles, cnRoot, cnX, cnY } from './TableResizeBox.css';

export function TableResizeBox(
    props: ResizableBoxProps & {
        localStorageKey: string;
    },
): ReactElement {
    const [rect, setRect] = useLocalStorage<Pick<ResizableBoxProps, 'width' | 'height'>>(
        props.localStorageKey,
        props,
        {
            raw: false,
            serializer: (v: object) => JSON.stringify(v),
            deserializer: (v: string) => {
                const data = JSON.parse(v);
                const obj = typeof data === 'object' ? data : props;
                return {
                    width: props.width !== undefined ? obj.width : undefined,
                    height: props.height !== undefined ? obj.height : undefined,
                };
            },
        },
    );
    const cbResizeStartOrStop = useFunction((_: unknown, { node }: ResizeCallbackData) => {
        // node is handler
        setRect({
            width: node.offsetWidth,
            height: node.offsetHeight,
        });
    });
    const cbResize = useFunction((_: unknown, { size }: ResizeCallbackData) => {
        setRect(size);
    });

    const withX = props.axis === 'x' || props.axis === 'both';
    const withY = props.axis === 'y' || props.axis === 'both';

    return (
        <ResizableBox
            className={props.className}
            axis={props.axis}
            width={rect!.width}
            height={rect!.height}
            onResizeStart={cbResizeStartOrStop}
            onResize={cbResize}
            onResizeStop={cbResizeStartOrStop}
            handle={
                <div className={cnHandles}>
                    {withX && <TableHandle x />}
                    {withY && <TableHandle y />}
                </div>
            }
        >
            {props.children}
        </ResizableBox>
    );
}

export function TableHandle(props: { x?: boolean; y?: boolean }): ReactElement {
    return (
        <div
            className={cn(cnRoot, {
                [cnX]: props.x,
                [cnY]: props.y,
            })}
        />
    );
}
