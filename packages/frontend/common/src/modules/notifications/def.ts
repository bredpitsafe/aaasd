import type { Assign, Milliseconds } from '@common/types';
import type { TraceId } from '@common/utils';
import type { AlertProps } from 'antd';
import type { ReactNode } from 'react';
import type { Observable } from 'rxjs';

import type { TSocketURL } from '../../types/domain/sockets.ts';

export enum ENotificationsType {
    Info = 'info',
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
}

export type TBaseNotificationProps = {
    id: string;
    type: ENotificationsType;
    message: string;
    description?: ReactNode;
    traceId?: TraceId;
    timestamp: Milliseconds;
    socketURL?: TSocketURL;
};

export type TPopupNotificationProps = {
    message?: ReactNode;
} & { duration: number; onClose?: () => {} };

export type TListNotificationProps = Pick<
    AlertProps,
    | 'icon'
    | 'closable'
    | 'closeText'
    | 'message'
    | 'description'
    | 'onClose'
    | 'afterClose'
    | 'onClick'
    | 'onMouseEnter'
    | 'onMouseLeave'
>;

export type TNotification = TBaseNotificationProps & {
    popupSettings?: TPopupNotificationProps;
    listSettings?: TListNotificationProps;
};

export type TNotificationProps = Assign<
    TNotification,
    Partial<Pick<TNotification, 'type' | 'id' | 'timestamp'>>
>;

export type IModuleNotifications = {
    list$: Observable<TNotification[]>;
    clearList: VoidFunction;
    deleteFromList: (is: string) => void;

    open(props: TNotificationProps): void;
    info(props: TNotificationProps): void;
    success(props: TNotificationProps): void;
    warning(props: TNotificationProps): void;
    error(props: TNotificationProps): void;
};
