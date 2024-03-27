import { ReactElement } from 'react';
import { Popover, PopoverProps } from 'react-tiny-popover'; // Try change to ant popover

import { StickyMouse } from './StickyMouse';

export function MousePopover(
    props: Omit<Parameters<typeof StickyMouse>[0], 'visible'> &
        Omit<PopoverProps, 'isOpen' | 'children'> & {
            initialMouseX?: number;
            initialMouseY?: number;
        },
): ReactElement {
    return (
        <Popover
            isOpen={true}
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
            <StickyMouse
                style={{ pointerEvents: 'none' }}
                offsetX={props.offsetX}
                offsetY={props.offsetY}
                initialMouseX={props.initialMouseX}
                initialMouseY={props.initialMouseY}
            />
        </Popover>
    );
}
