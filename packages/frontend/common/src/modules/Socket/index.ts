import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import { BFFSocket } from '../../lib/BFFSocket/BFFSocket';
import { AuthenticationPlugin } from '../../lib/BFFSocket/plugins/AuthenticationPlugin';
import { CloseOnTimeout } from '../../lib/BFFSocket/plugins/CloseOnTimeout.ts';
import { ReconnectOnClose } from '../../lib/BFFSocket/plugins/ReconnectOnClose';
import { SendHeartbeats } from '../../lib/BFFSocket/plugins/SendHeartbeats';
import { ServerTimePlugin } from '../../lib/BFFSocket/plugins/ServerTimePlugin';
import { SocketStatusPlugin } from '../../lib/BFFSocket/plugins/SocketStatusPlugin';
import type { ISocketPlugin } from '../../lib/Socket/def';
import { Socket } from '../../lib/Socket/Socket';
import { getReconnectPluginCallbacks } from '../../lib/Socket/utils/getReconnectPluginCallbacks';
import { getSocketAuthenticationCallback } from '../../lib/Socket/utils/getSocketAuthenticationCallback';
import { getSocketServerTimeCallback } from '../../lib/Socket/utils/getSocketServerTimeCallback';
import { getSocketStatusCallback } from '../../lib/Socket/utils/getSocketStatusCallback';
import type { TSocketStruct, TSocketURL } from '../../types/domain/sockets';
import { createBank } from '../../utils/Bank';
import { EMPTY_OBJECT } from '../../utils/const';
import { debounceBy } from '../../utils/debounceBy';
import { isSharedWorker, isWorker } from '../../utils/detect';
import type { TDataSourceName } from '../dataSourceStatus/defs';
import { SOCKET_STAR_NAME } from '../socketList/defs';
import { FOCUS_LOST_DELAY, HEARTBEATS_INTERVAL, NO_MESSAGES_DELAY } from './def';

function createModule(
    ctx: TContextRef,
    { keepStarAlive }: { keepStarAlive?: boolean } = EMPTY_OBJECT,
) {
    return {
        Socket,
        socketBank: createSocketBank(ctx, (name) =>
            keepStarAlive
                ? // TODO: Remove hack after https://gitlab.advsys.work/platform/frontend/-/merge_requests/647
                  name.toLocaleLowerCase() !== SOCKET_STAR_NAME
                : true,
        ),
    };
}

const getCommonPlugins = (
    ctx: TContextRef,
    name: TDataSourceName,
    url: TSocketURL,
): ISocketPlugin[] => {
    const serverTimeCallbacks = getSocketServerTimeCallback(ctx, name, url);
    const reconnectCallbacks = getReconnectPluginCallbacks(ctx);
    const statusCallbacks = getSocketStatusCallback(ctx, name, url);
    const authenticationCallbacks = getSocketAuthenticationCallback(ctx);

    return [
        new SendHeartbeats({
            interval: HEARTBEATS_INTERVAL,
            focusLostDelay: FOCUS_LOST_DELAY,
        }),
        new CloseOnTimeout({ delay: NO_MESSAGES_DELAY }),
        new ServerTimePlugin(serverTimeCallbacks),
        new ReconnectOnClose(reconnectCallbacks),
        new SocketStatusPlugin(statusCallbacks),
        new AuthenticationPlugin(authenticationCallbacks),
    ];
};

const contextName = isSharedWorker ? 'Shared worker' : isWorker ? 'Worker' : 'Tab';

const createSocketBank = (
    ctx: TContextRef,
    allowRemove: (url: TSocketURL) => boolean | Promise<boolean>,
) =>
    createBank({
        createKey: (props: TSocketStruct) => props.url,
        createValue: (key, { name, url }) => {
            const getPlugins = (name: TDataSourceName) => getCommonPlugins(ctx, name, url);
            const urlInstance = new URL(url);

            return new BFFSocket(
                name,
                urlInstance,
                undefined,
                getPlugins(`${contextName} ${name}`),
            );
        },

        onRemove: (url, socket) => {
            socket.destroy();
        },

        onRelease: debounceBy(
            async (key, value, bank) => {
                if (await allowRemove(key)) bank.removeIfDerelict(key);
            },
            ([key]) => ({ group: key, delay: 10_000 }),
        ),
    });

export type ISocketBank = ReturnType<typeof createSocketBank>;
export type IModuleSocket = ReturnType<typeof createModule>;

export const ModuleSocket = ModuleFactory(createModule);
