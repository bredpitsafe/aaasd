import type { ReactElement } from 'react';
import type { PopoverProps } from 'react-tiny-popover';
import { Popover } from 'react-tiny-popover'; // Try change to ant popover

import { StickyCursor } from './StickyCursor';

export function MousePopover(
    props: Omit<Parameters<typeof StickyCursor>[0], 'visible'> &
        Omit<PopoverProps, 'isOpen' | 'children'> & {
            initialMouseX?: number;
            initialMouseY?: number;
        },
): ReactElement {
    return (
        <Popover
            isOpen
            containerStyle={{ ...props.containerStyle, pointerEvents: 'none' }}
            content={props.content}
            positions={props.positions}
            align={props.align}
            padding={props.padding}
            reposition={props.reposition}
            containerClassName={props.containerClassName}
            parentElement={props.parentElement}
            contentLocation={props.contentLocation}
            boundaryElement={props.boundaryElement}
            boundaryInset={props.boundaryInset}
            boundaryTolerance={props.boundaryTolerance}
            onClickOutside={props.onClickOutside}
        >
            <StickyCursor
                style={{ pointerEvents: 'none' }}
                offsetX={props.offsetX}
                offsetY={props.offsetY}
                mouseX={props.initialMouseX}
                mouseY={props.initialMouseY}
            />
        </Popover>
    );
}
