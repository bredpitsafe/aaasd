import './CloseEvent';

import { assert } from '@common/utils/src/assert.ts';
import { EventEmitter } from 'eventemitter3';

import { noop } from '../../utils/fn';
import type { TLogger } from '../../utils/Tracing';
import { logger } from '../../utils/Tracing';
import { Binding } from '../../utils/Tracing/Children/Binding';
import type { ISocketPlugin } from './def';
import { ESocketCloseReason } from './def';

export enum EWebSocketReadyState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3,
}

export enum EWebSocketCloseCode {
    RECONNECT = 4000,
    DESTROY = 4001,
    OFFLINE = 4002,
    MANUAL_CLOSE = 4003,
}

export type TWebSocketListenerDataMap = {
    opening: Event;
    open: Event;
    error: Event;
    close: CloseEvent & { code: number | EWebSocketCloseCode };
    closing: CloseEvent & { code: number | EWebSocketCloseCode };
    message: MessageEvent;
    // can be usefull for plugins
    send: TSendData;
};

export type TSendData =
    | Record<string, unknown>
    | Record<string, unknown>[]
    | string
    | string[]
    | ArrayBufferLike
    | Blob
    | ArrayBufferView;

export class Socket<DataMap extends TWebSocketListenerDataMap = TWebSocketListenerDataMap> {
    protected ee = new EventEmitter();
    protected ws: undefined | WebSocket;
    private closingState = false;
    private logger: TLogger;

    constructor(
        public readonly url: URL,
        public readonly protocols?: string | string[],
        protected plugins: ISocketPlugin[] = [],
    ) {
        this.logger = logger.child(new Binding(`Socket|${this.url}`));
        this.loadPlugins(plugins);
        this.createWebSocket();
    }

    destroy(): void {
        this.logger.info(`destroy start`);
        this.ee.removeAllListeners();
        this.unloadPlugins();
        this.destroyWebSocket(EWebSocketCloseCode.DESTROY, ESocketCloseReason.DestroySocket, true);
    }

    connect(): void {
        this.logger.info(`connect start`);
        this.createWebSocket();
    }

    disconnect(code: EWebSocketCloseCode, reason: ESocketCloseReason, wasClean: boolean): void {
        this.logger.info(`disconnect start`);
        this.destroyWebSocket(code, reason, wasClean);
    }

    reconnect(reason: ESocketCloseReason): void | Error {
        this.logger.info(`reconnect start`);
        this.destroyWebSocket(EWebSocketCloseCode.RECONNECT, reason, true);
        this.connect();
    }

    on<T extends keyof DataMap>(type: T, listener: (data: DataMap[T]) => unknown): this {
        this.ee.on(type as string, listener);
        return this;
    }

    off<T extends keyof DataMap>(type: T, listener: (data: DataMap[T]) => unknown): this {
        this.ee.off(type as string, listener);
        return this;
    }

    send(data: TSendData): this {
        assert(this.isOpened(), "can't send data since socket is not opened yet");
        this.ws!.send(typeof data === 'object' ? JSON.stringify(data) : data);
        this.emitWs('send', data);

        return this;
    }

    doesExist(): this is Socket & { ws: WebSocket } {
        return this.ws !== undefined;
    }

    isClosing(): boolean {
        return (
            this.doesExist() &&
            (this.closingState || this.ws.readyState === EWebSocketReadyState.CLOSING)
        );
    }

    isOpening(): boolean {
        return !this.isClosing() && this.ws?.readyState === EWebSocketReadyState.CONNECTING;
    }

    isOpened(): boolean {
        return !this.isClosing() && this.ws?.readyState === EWebSocketReadyState.OPEN;
    }

    isClosed(): boolean {
        return (
            !this.doesExist() ||
            (!this.isClosing() && this.ws?.readyState === EWebSocketReadyState.CLOSED)
        );
    }

    isConnecting(): boolean {
        return !this.isClosing() && this.ws?.readyState === EWebSocketReadyState.CONNECTING;
    }

    getReadyState(): undefined | EWebSocketReadyState {
        return this.ws?.readyState;
    }
    getPlugin<T extends ISocketPlugin>(
        detector: (plugin: ISocketPlugin) => asserts plugin is T,
    ): undefined | T {
        return this.plugins.find(detector) as undefined | T;
    }

    protected addWebSocketListeners(): void {
        this.assertWebSocketExists();

        this.ws!.addEventListener('message', this.onMessage);
        this.ws!.addEventListener('open', this.onOpen);
        this.ws!.addEventListener('close', this.onClose);
        this.ws!.addEventListener('error', this.onError);
    }

    protected removeWebSocketListeners(): void {
        this.assertWebSocketExists();

        this.ws!.removeEventListener('message', this.onMessage);
        this.ws!.removeEventListener('open', this.onOpen);
        this.ws!.removeEventListener('close', this.onClose);
        this.ws!.removeEventListener('error', this.onError);
    }

    protected createWebSocket(): void {
        if (this.doesExist()) {
            this.logger.info(`already exists`);
            return;
        }

        this.logger.info(`createWebSocket start`);
        this.openWebSocket();
        this.addWebSocketListeners();
        this.logger.info(`createWebSocket opened and set listeners`);
    }

    protected destroyWebSocket(
        code: number | EWebSocketCloseCode,
        reason: ESocketCloseReason,
        wasClean: boolean,
    ): void {
        if (!this.doesExist()) {
            this.logger.info(`already destroyed`);
            return;
        }

        this.logger.info(`destroying started`, { code, reason, wasClean });
        this.removeWebSocketListeners();
        const onFinish = this.closeWebSocket(code, reason, wasClean);
        // @ts-ignore
        this.ws = undefined;
        this.logger.info(`destroying finished`);

        onFinish();
    }

    protected openWebSocket(): void {
        this.assertWebSocketNotExist();

        this.closingState = false;
        this.ws = new WebSocket(this.url, this.protocols);
        this.ws.binaryType = 'arraybuffer';
        this.onOpening();
    }

    protected closeWebSocket(
        code: number | EWebSocketCloseCode,
        reason: ESocketCloseReason,
        wasClean: boolean,
    ): VoidFunction {
        this.assertWebSocketExists();

        if (this.isClosed()) {
            this.logger.info(`already closed`);
            return noop;
        }

        const isClosing = this.isClosing();
        const options = {
            code,
            reason,
            wasClean,
        };

        this.logger.info(`closing started`, options);

        if (!isClosing) {
            this.closingState = true;
        }

        this.ws!.close(code, reason);

        this.logger.info(`closing finished`);

        return () => {
            if (!isClosing) {
                this.emitWs('closing', new CloseEvent('closing', options));
            }
        };
    }

    protected onMessage = (event: MessageEvent): boolean => {
        this.emitWs('message', event);
        return false;
    };

    protected onOpening = (): boolean => {
        this.logger.info(`socket opening`);
        this.emitWs('opening', new Event('opening'));
        return false;
    };

    protected onOpen = (event: Event): boolean => {
        this.logger.info(`socket opened`);
        this.emitWs('open', event);
        return false;
    };

    protected onClose = (event: CloseEvent): boolean => {
        this.logger.info(`socket closed`, {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
        });
        this.closingState = false;
        this.emitWs('close', event);
        return false;
    };

    protected onError = (event: Event): boolean => {
        this.logger.error(`socket failed`);
        this.closingState = false;
        this.emitWs('error', event);
        return false;
    };

    protected emitWs<T extends keyof DataMap>(type: T, data: DataMap[T]): void {
        this.ee.emit(type as string, data);
    }

    protected loadPlugins(plugins: ISocketPlugin[] = []): void {
        this.plugins = plugins;
        this.plugins.forEach((plugin) => plugin.connect(this));
    }

    protected unloadPlugins(): void {
        this.plugins.forEach((plugin) => plugin.disconnect(this));
    }

    private assertWebSocketExists(): this is Socket & { ws: WebSocket } {
        assert(this.doesExist(), 'Socket does not exist');
        return true;
    }

    private assertWebSocketNotExist(): this is Socket & { ws: undefined } {
        assert(!this.doesExist(), 'Socket already exists');
        return true;
    }
}
