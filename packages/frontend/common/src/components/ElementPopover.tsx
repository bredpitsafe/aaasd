import type { ReactElement } from 'react';
import type { PopoverProps } from 'react-tiny-popover';
import { Popover } from 'react-tiny-popover';

import { StickyElement } from './StickyElement';

export function ElementPopover(
    props: Omit<Parameters<typeof StickyElement>[0], 'visible'> &
        Omit<PopoverProps, 'isOpen' | 'children'>,
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
            <StickyElement
                elementRef={props.elementRef}
                style={{ pointerEvents: 'none' }}
                offsetX={props.offsetX}
                offsetY={props.offsetY}
            />
        </Popover>
    );
}
