import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useRef } from 'react';
import { useEvent } from 'react-use';
import useResizeObserver from 'use-resize-observer';

import type { TWithClassname } from '../../../types/components';
import { cnMonaco, cnRoot } from './EditorContainer.css';

export function EditorContainer(
    props: TWithClassname & {
        children: (props: {
            container: HTMLDivElement;
            header: HTMLDivElement;
            width: number;
            height: number;
        }) => ReactElement;
    },
): ReactElement {
    const rootRef = useRef<HTMLDivElement>(null);
    const monacoRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    const { width, height } = useResizeObserver({ ref: rootRef });

    // Catch all keyboard events from Monaco and stop their propagation
    // to prevent interference with global application keyboard shortcuts.
    useEvent(
        'keyup',
        (event) => {
            event.stopPropagation();
        },
        monacoRef.current,
    );

    return (
        <>
            <div ref={headerRef} />
            <div ref={rootRef} className={cn(props.className, cnRoot)}>
                <div ref={monacoRef} className={cnMonaco}>
                    {!isNil(monacoRef.current) &&
                        !isNil(headerRef.current) &&
                        width !== undefined &&
                        height !== undefined &&
                        width > 0 &&
                        height > 0 &&
                        props.children({
                            container: monacoRef.current,
                            width: width,
                            height: height,
                            header: headerRef.current,
                        })}
                </div>
            </div>
        </>
    );
}
