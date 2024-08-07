import type { Socket } from './Socket';

export interface ISocketPlugin {
    connect(host: Socket): void;
    disconnect(host: Socket): void;
}

export enum ESocketCloseReason {
    Reconnect = 'reconnect',
    DestroySocket = 'destroySocket',
    NoMessages = 'noMessages',
    FocusLost = 'focusLost',
}
