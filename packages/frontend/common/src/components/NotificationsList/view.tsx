import { ClearOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { useToggle } from 'react-use';

import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '../../../e2e/selectors/main-menu.modal.selectors.ts';
import type { TNotification } from '../../modules/notifications/def';
import { ENotificationsType } from '../../modules/notifications/def';
import type { TWithClassname } from '../../types/components';
import { arrayPush } from '../../utils/arrayPush';
import { blue, green, orange, red } from '../../utils/colors';
import { useFunction } from '../../utils/React/useFunction';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { CommonErrorView } from '../CommonErrorView';
import { Drawer } from '../Drawer';
import { Space } from '../Space';
import { cnAlert, cnList } from './view.css';

export type TNotificationsListProps = TWithClassname & {
    list: TNotification[];
    onClear?: VoidFunction;
    onClose?: VoidFunction;
    onCloseItem?: (id: string) => void;
};

const drawerBodyStyle = { padding: 0 };
export function NotificationsList({
    list,
    onClose,
    onClear,
    onCloseItem,
}: TNotificationsListProps): ReactElement {
    const [open, toggleOpen] = useToggle(false);
    const color = useMemo(() => {
        if (isEmpty(list)) {
            return;
        }
        const last = list[list.length - 1];
        return getColorByType(last['type']);
    }, [list]);
    const cbClose = useFunction(() => {
        toggleOpen(false);
        onClose?.();
    });
    const cbClear = useFunction(() => {
        onClear?.();
        cbClose();
    });

    const hasNotifications = useMemo(() => !isEmpty(list), [list]);

    return (
        <>
            <Button
                {...EMainMenuProps[EMainMenuModalSelectors.NotificationsListButton]}
                title={hasNotifications ? 'Notifications' : 'No active notifications'}
                type="text"
                size="middle"
                disabled={!hasNotifications}
                icon={<InfoCircleOutlined style={{ color }} />}
                onClick={toggleOpen}
            />
            <Drawer
                title="Notifications"
                placement="right"
                open={open}
                onClose={cbClose}
                bodyStyle={drawerBodyStyle}
                extra={
                    <Button
                        shape="circle"
                        title="Clear all notifications"
                        icon={<ClearOutlined />}
                        onClick={cbClear}
                    />
                }
            >
                <ListNotifications list={list} onClose={onCloseItem} />
            </Drawer>
        </>
    );
}

function ListNotifications({
    list,
    onClose,
}: {
    list: TNotification[];
    onClose?: (id: string) => void;
}): ReactElement {
    const concatenatedList = useMemo(() => {
        return Array.from(
            list
                .reduce((map, item, i) => {
                    if (item.traceId !== undefined) {
                        map.set(item.traceId, arrayPush(map.get(item.traceId) || [], item));
                    } else {
                        map.set(i, [item]);
                    }

                    return map;
                }, new Map<string | number, TNotification[]>())
                .values(),
        );
    }, [list]);
    return (
        <Space direction="vertical" className={cnList}>
            {concatenatedList?.map((item) => {
                return <NotificationGroup key={item[0].traceId} items={item} onClose={onClose} />;
            })}
        </Space>
    );
}

function NotificationGroup({
    items,
    onClose,
}: {
    items: TNotification[];
    onClose?: (id: string) => void;
}): ReactElement {
    const item = items[0];
    const cbClose = useFunction(() => items.forEach(({ id }) => onClose?.(id)));

    return (
        <Alert
            {...item.listSettings}
            key={item.timestamp}
            className={cnAlert}
            type={item.type}
            message={
                <CommonErrorView style={{ marginBottom: '8px' }} count={items.length} {...item} />
            }
            closable={item.listSettings?.closable ?? true}
            onClose={cbClose}
        />
    );
}

function getColorByType(type: ENotificationsType | void): string | undefined {
    switch (type) {
        case ENotificationsType.Error:
            return red.primary;
        case ENotificationsType.Warning:
            return orange.primary;
        case ENotificationsType.Success:
            return green.primary;
        case ENotificationsType.Info:
            return blue.primary;
        default:
            return undefined;
    }
}
