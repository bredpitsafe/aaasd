import { receiveFromTabs, sendToTabs, tapError } from '@common/rx';
import type { DBSchema, IDBPDatabase, StoreKey, StoreNames, StoreValue } from 'idb';
import { union } from 'lodash-es';
import type { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';
import { mergeMap, Observable } from 'rxjs';

import { deleteDatabaseItems, readDatabaseItems, updateDatabaseItems } from '../DB/utils';
import type { TDeepDiff } from '../deepDiff';
import type { TShallowDiff } from '../shallowDiff';
import { logger } from '../Tracing';
import { progressiveRetry } from './progressiveRetry';

export enum EDatabaseErrorCallbackType {
    Blocked = 'Blocked',
    Blocking = 'Blocking',
    Terminated = 'Terminated',
}

export type TDatabaseErrorCallback = (type: EDatabaseErrorCallbackType) => void | Promise<void>;

export type TDatabaseCreator<T extends DBSchema> = (
    callback: TDatabaseErrorCallback,
) => Promise<IDBPDatabase<T>>;

export function createDatabase$<T extends DBSchema>(
    creator: TDatabaseCreator<T>,
): Observable<IDBPDatabase<T>> {
    return new Observable<IDBPDatabase<T>>((observer) => {
        creator((type: EDatabaseErrorCallbackType) =>
            observer.error(new Error(`Database is in '${type}' state, reconnecting`)),
        ).then(
            (database) => observer.next(database),
            (error) => observer.error(error),
        );
    });
}

export function logDatabaseError<T extends DBSchema>(): MonoTypeOperatorFunction<IDBPDatabase<T>> {
    return tapError((err) => logger.error(err));
}

export function databaseReconnect<T extends DBSchema>(): MonoTypeOperatorFunction<IDBPDatabase<T>> {
    return progressiveRetry({ initialInterval: 5_000 });
}

export type TInrementWriteProps<TSchema extends DBSchema> = {
    storageName: StoreNames<TSchema>;
    source: Record<
        Extract<StoreKey<TSchema, StoreNames<TSchema>>, string>,
        StoreValue<TSchema, StoreNames<TSchema>>
    >;
    diffKeys:
        | TShallowDiff<Extract<StoreKey<TSchema, StoreNames<TSchema>>, string>>
        | TDeepDiff<Extract<StoreKey<TSchema, StoreNames<TSchema>>, string>>;
};

export function incrementWriteToDB$<TSchema extends DBSchema>(
    database: IDBPDatabase<TSchema>,
): OperatorFunction<TInrementWriteProps<TSchema>, TInrementReadProps<TSchema>> {
    return mergeMap(
        async (props: TInrementWriteProps<TSchema>): Promise<TInrementReadProps<TSchema>> => {
            const { diffKeys, storageName, source } = props;
            const { added, updated, deleted } = diffKeys;

            if (added.length === 0 && updated.length === 0 && deleted.length === 0) {
                return {
                    storageName: props.storageName,
                    diffKeys: props.diffKeys,
                };
            }

            const valuesToUpsert = union(added, updated).map(
                (key) =>
                    [key, source[key]] as [
                        StoreKey<TSchema, StoreNames<TSchema>>,
                        StoreValue<TSchema, StoreNames<TSchema>>,
                    ],
            );
            const transaction = database.transaction(storageName, 'readwrite');
            const upsertOperation = updateDatabaseItems(transaction, valuesToUpsert);
            const deleteOperation = deleteDatabaseItems(
                transaction,
                deleted as StoreKey<TSchema, StoreNames<TSchema>>[],
            );

            return Promise.all([...upsertOperation, ...deleteOperation, transaction.done])
                .then(
                    () =>
                        logger.info(
                            `Performed ${
                                added.length + updated.length + deleted.length
                            } operations in '${database.name}.${String(storageName)}'`,
                        ),
                    (error) =>
                        logger.error(
                            `Error occurred when saving in '${database.name}.${String(
                                storageName,
                            )}'`,
                            error,
                        ),
                )
                .then(() => ({
                    storageName: props.storageName,
                    diffKeys: props.diffKeys,
                }));
        },
    );
}

export type TInrementReadProps<TSchema extends DBSchema> = {
    storageName: StoreNames<TSchema>;
    diffKeys: TShallowDiff<Extract<StoreKey<TSchema, StoreNames<TSchema>>, string>>;
};

export type TInrementReadResult<TSchema extends DBSchema> = {
    deletedKeys: Extract<StoreKey<TSchema, StoreNames<TSchema>>, string>[];
    upsertedKeys: Extract<StoreKey<TSchema, StoreNames<TSchema>>, string>[];
    upsertedValues: (undefined | StoreValue<TSchema, StoreNames<TSchema>>)[];
};
export function incrementReadFromDB<TSchema extends DBSchema>(
    database: IDBPDatabase<TSchema>,
): OperatorFunction<TInrementReadProps<TSchema>, TInrementReadResult<TSchema>> {
    return mergeMap(
        async (props: TInrementReadProps<TSchema>): Promise<TInrementReadResult<TSchema>> => {
            const { added, updated, deleted } = props.diffKeys;
            const upserted = union(added, updated);
            const transaction = database.transaction(
                props.storageName as StoreNames<TSchema>,
                'readonly',
            );
            const upsertedValues = readDatabaseItems(
                transaction,
                upserted as StoreKey<TSchema, StoreNames<TSchema>>[],
            );

            return transaction.done
                .then(() => Promise.all(upsertedValues))
                .then((upsertedValues) => ({
                    deletedKeys: deleted,
                    upsertedKeys: upserted,
                    upsertedValues,
                }));
        },
    );
}

type TMessageChangesDB<TSchema extends DBSchema> = {
    storageName: StoreNames<TSchema>;
    diffKeys: TShallowDiff<Extract<StoreKey<TSchema, StoreNames<TSchema>>, string>>;
};

export function broadcastChangesDB$<TSchema extends DBSchema>(
    channel: string,
): MonoTypeOperatorFunction<TMessageChangesDB<TSchema>> {
    return sendToTabs<TMessageChangesDB<TSchema>>(`DATABASE_CHANNEL:${channel}`);
}

export function receiveChangesDB<TSchema extends DBSchema>(
    channel: string,
): Observable<TMessageChangesDB<TSchema>> {
    return receiveFromTabs<TMessageChangesDB<TSchema>>(`DATABASE_CHANNEL:${channel}`);
}
