import cn from 'classnames';
import { ReactElement, useState } from 'react';

import { TDragAction } from '../hooks/useDragAndDrop/def';
import { useDrop } from '../hooks/useDragAndDrop/useDrop';
import { TWithClassname } from '../types/components';
import { cnDropper, cnDropping } from './DragAndDrop.css';
import { Overlay, TOverlayProps } from './overlays/Overlay';
import { Title } from './Title';

type TDragAndDropProps = TWithClassname &
    TOverlayProps & {
        onDropStateChange?(dropping: boolean): void;
        filterDrop?: (event: DragEvent, action?: TDragAction) => boolean;
        onDrop: (action: TDragAction) => void | boolean | Promise<boolean>;
    };

export function DragAndDrop(props: TDragAndDropProps): ReactElement {
    const [dropping, setDropping] = useState(false);

    useDrop({
        filter: props.filterDrop,
        onDrop: props.onDrop,
        onDropStateChange: (state) => {
            setDropping(state);
            props.onDropStateChange?.(state);
        },
    });

    return (
        <Overlay
            className={cn(props.className, cnDropper, {
                [cnDropping]: dropping,
            })}
        >
            {props.children !== undefined ? props.children : <Title level={2}>Drop here</Title>}
        </Overlay>
    );
}
