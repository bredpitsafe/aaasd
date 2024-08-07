import { DeleteOutlined } from '@ant-design/icons';
import { Button } from '@frontend/common/src/components/Button';
import { List } from '@frontend/common/src/components/List';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { MouseEvent, ReactElement } from 'react';
import { useCallback } from 'react';

import {
    cnLayoutItem,
    cnLayoutItemActive,
    cnLayoutItemDeleteBtn,
    cnLayoutItemLabel,
} from './LayoutItem.css';

export function LayoutItem({
    active,
    name,
    switchLayout,
    deleteLayout,
}: {
    active: string;
    name: string;
    switchLayout: (layoutName: string) => void;
    deleteLayout?: (layoutName: string) => void;
}): ReactElement {
    const deleteCurrentLayout = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();

            deleteLayout?.(name);
        },
        [deleteLayout, name],
    );
    const switchToCurrentLayout = useCallback(() => switchLayout(name), [switchLayout, name]);

    return (
        <List.Item
            className={cn(cnLayoutItem, {
                [cnLayoutItemActive]: active === name,
            })}
            onClick={active !== name ? switchToCurrentLayout : undefined}
        >
            <div className={cnLayoutItemLabel}>{name}</div>

            {!isNil(deleteLayout) && (
                <Button
                    className={cnLayoutItemDeleteBtn}
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={deleteCurrentLayout}
                />
            )}
        </List.Item>
    );
}
