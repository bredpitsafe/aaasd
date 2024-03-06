import { AlertProps } from '@frontend/common/src/components/Alert';
import type { TContextRef } from '@frontend/common/src/di';
import { useContextRef } from '@frontend/common/src/di/react';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import type { EComponentType } from '@frontend/common/src/types/domain/component';
import type { TGateId } from '@frontend/common/src/types/domain/gates';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { getComponentPrefix } from '@frontend/common/src/utils/component';
import { prepareImportable } from '@frontend/common/src/utils/CustomView/parse';
import {
    TCustomViewCompiledGrid,
    TCustomViewCompiledTable,
} from '@frontend/common/src/utils/CustomView/parsers/defs';
import { createDB } from '@frontend/common/src/utils/DB/createDB';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { DBSchema, IDBPDatabase } from 'idb';
import { isEmpty, isNil } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

const DBName = 'custom-view-configs';
const DBTable = 'key-config';

interface Schema extends DBSchema {
    [DBTable]: {
        key: string;
        value: string;
    };
}

function createCustomIndicatorDB(ctx: TContextRef): Promise<IDBPDatabase<Schema>> {
    const { error } = ModuleNotifications(ctx);

    return createDB<Schema>(DBName, 1, {
        blocked() {
            error({
                message: 'The Custom View database has been blocked',
                description: 'For correct work you must reload page!',
                popupSettings: {
                    duration: 0,
                },
            });
        },
        blocking() {
            error({
                message: 'The Custom View database has been blocked',
                description: 'For correct work you must reload page!',
                popupSettings: {
                    duration: 0,
                },
            });
        },
        terminated() {
            error({
                message: 'The Custom View database has been terminated',
                description: 'For correct work you must reload page!',
                popupSettings: {
                    duration: 0,
                },
            });
        },
        upgrade(database: IDBPDatabase<Schema>, oldVersion: number) {
            if (oldVersion < 1) {
                database.createObjectStore(DBTable);
            }
        },
    });
}

export function useCustomIndicatorConfigDB(
    socketName: string | undefined,
    type: EComponentType,
    id: TRobotId | TGateId,
): [boolean, string, (config?: string) => Promise<void>] {
    const key = useMemo(
        () => (socketName ? `${socketName} - ${getComponentPrefix(type)} - ${id}` : undefined),
        [socketName, type, id],
    );

    const ctx = useContextRef();
    const store = useMemo(() => createCustomIndicatorDB(ctx), [ctx]);
    const [item, setItem] = useState<string>('');
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
        setIsInitialized(false);

        if (!key) {
            return;
        }

        store
            .then((store) => store.get(DBTable, key!))
            .then((value) => {
                setItem(value ?? '');
                setIsInitialized(true);
            });
    }, [key, store]);

    const setValue = useFunction((config?: string): Promise<void> => {
        if (key) {
            return store.then(async (store) => {
                setItem(config ?? '');

                if (config) {
                    await store.put(DBTable, config, key);
                } else {
                    await store.delete(DBTable, key);
                }
            });
        }

        return Promise.resolve();
    });

    return [isInitialized, item, setValue];
}

type TUseCompiledTableReturnType =
    | {
          result: TCustomViewCompiledTable | TCustomViewCompiledGrid;
          error: undefined;
      }
    | {
          result: undefined;
          error: {
              title: string;
              message: string;
              type: AlertProps['type'];
          };
      };

export function useCompiledTable(
    config: string,
    socketUrl: TSocketURL,
): TUseCompiledTableReturnType {
    return useMemo(() => {
        if (isEmpty(config)) {
            return {
                result: undefined,
                error: {
                    title: 'Empty configuration',
                    message: 'Check configuration, all tags and attributes should be in low case',
                    type: 'warning' as AlertProps['type'],
                },
            };
        }

        try {
            const result = prepareImportable(config, socketUrl);
            if (isNil(result)) {
                return {
                    result: undefined,
                    error: {
                        title: 'Failed to compile',
                        message:
                            'Failed to compile provided configuration. Check configuration for errors',
                        type: 'error' as AlertProps['type'],
                    },
                };
            }

            return {
                result,
                error: undefined,
            };
        } catch (e) {
            return {
                result: undefined,
                error: {
                    title: 'Parse error',
                    message: (e as Error).message,
                    type: 'error' as AlertProps['type'],
                },
            };
        }
    }, [config, socketUrl]);
}
