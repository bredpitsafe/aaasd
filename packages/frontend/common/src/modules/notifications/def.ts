import { AlertProps } from 'antd';
import { ReactNode } from 'react';
import { Observable } from 'rxjs';

import { Assign } from '../../types';
import { TSocketURL } from '../../types/domain/sockets.ts';
import { Milliseconds } from '../../types/time';
import { TraceId } from '../../utils/traceId';

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
