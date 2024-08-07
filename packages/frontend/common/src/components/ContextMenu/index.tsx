import 'react-contexify/dist/ReactContexify.css';
import './style.css';

import cn from 'classnames';
import type { ComponentProps } from 'react';
import type { TriggerEvent } from 'react-contexify';
import { Item as LibItem, useContextMenu } from 'react-contexify';

export { Menu, Submenu } from 'react-contexify';

import { cnActiveItem } from './styles.css';

export function createHookContextMenu<Props = unknown>(
    id: string,
): () => {
    show: (params: { event: TriggerEvent; props: Props }) => void;
    hideAll: () => void;
} {
    return () =>
        useContextMenu({
            id,
        });
}

type TItemProps = ComponentProps<typeof LibItem> & {
    active?: boolean;
};

export function Item({ active, children, ...props }: TItemProps) {
    return (
        <LibItem
            className={cn({
                [cnActiveItem]: active,
            })}
            {...props}
        >
            {children}
        </LibItem>
    );
}
