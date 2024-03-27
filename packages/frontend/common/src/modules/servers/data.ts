import { isEmpty, isNull, keyBy, omit } from 'lodash-es';
import memoize from 'memoizee';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TServer, TServerId } from '../../types/domain/servers';
import { FailFactory } from '../../types/Fail';
import { ValueDescriptor } from '../../types/ValueDescriptor';
import { assertNever } from '../../utils/assert';
import { createComputedBox, createObservableBox } from '../../utils/rx';
import {
    createFailDescriptor,
    createSynchronizedDescriptor,
    createUnsynchronizedDescriptor,
    matchValueDescriptor,
} from '../../utils/ValueDescriptor';
import { sortByName } from '../utils';

const ServersFail = FailFactory('Servers');
export const SERVERS_NOT_AVAILABLE = ServersFail('NOT_AVAILABLE');
type TServerCollection = Record<TServerId, TServer>;
type TServersDescriptor = ValueDescriptor<TServerCollection, typeof SERVERS_NOT_AVAILABLE>;

export const boxServers = createObservableBox<TServersDescriptor>(
    createUnsynchronizedDescriptor(null),
);

export const getServer$ = memoize(
    (id?: TServerId): Observable<TServer | void> => {
        return boxServers.obs.pipe(
            map((servers) => {
                if (!isNull(servers.value)) {
                    return id ? servers.value[id] : undefined;
                }

                return undefined;
            }),
        );
    },
    { primitive: true, max: 100 },
);

export const upsertServers = (servers: TServer[]): void => {
    boxServers.set((prev) => {
        return matchValueDescriptor(prev, {
            idle: () => prev,
            unsynchronized: () => {
                if (isEmpty(servers)) {
                    return createFailDescriptor(SERVERS_NOT_AVAILABLE);
                }

                return createSynchronizedDescriptor(
                    keyBy(servers, 'id') as TServerCollection,
                    null,
                );
            },
            synchronized: (prevServers) => {
                return createSynchronizedDescriptor(
                    {
                        ...prevServers,
                        ...(keyBy(servers, 'id') as TServerCollection),
                    },
                    null,
                );
            },
            fail: () => {
                if (isEmpty(servers)) {
                    return createFailDescriptor(SERVERS_NOT_AVAILABLE);
                }

                return createSynchronizedDescriptor(servers, null);
            },
        });
    });
};

export const deleteServers = (serverIds?: TServerId[]): void => {
    boxServers.set((prev) => {
        return matchValueDescriptor(prev, {
            idle: () => prev,
            unsynchronized: () => prev,
            synchronized: (s) => {
                if (serverIds) {
                    return createSynchronizedDescriptor(omit(s, serverIds), null);
                }

                return createSynchronizedDescriptor({}, null);
            },
            fail: () => prev,
        });
    });
};

export const getServer = (id?: TServerId): TServer | void => {
    const servers = boxServers.get();

    if (!isNull(servers.value)) {
        return id ? servers.value[id] : undefined;
    }

    return undefined;
};

const ServersListFail = FailFactory('ServersList');
export const SERVERS_LIST_NOT_AVAILABLE = ServersListFail('NOT_AVAILABLE');
type TServerListDescriptor = ValueDescriptor<TServer[], typeof SERVERS_LIST_NOT_AVAILABLE>;

export const boxServersList = createComputedBox<TServerListDescriptor>(
    boxServers.obs.pipe(
        map((serversDescriptor): TServerListDescriptor => {
            return matchValueDescriptor(serversDescriptor, {
                idle: () => createUnsynchronizedDescriptor(null),
                unsynchronized: () => createUnsynchronizedDescriptor(null),
                synchronized: (s) =>
                    createSynchronizedDescriptor(sortByName(Object.values(s)), null),
                fail: (f) => {
                    switch (f.code) {
                        case '[Servers]: NOT_AVAILABLE':
                            return createFailDescriptor(SERVERS_LIST_NOT_AVAILABLE);
                        default:
                            assertNever(f.code);
                    }
                },
            });
        }),
    ),
    createUnsynchronizedDescriptor(null),
);

export const getServersList = (): TServerListDescriptor => boxServersList.get();
