import { EPlatformSocketRemoteProcedureName } from '@common/rpc';
import type { EApplicationName } from '@common/types';
import { generateTraceId } from '@common/utils';
import { groupBy, isArray, isEqual, isNil } from 'lodash-es';
import { catchError, filter, first, map, of, switchMap, throwError, timeout } from 'rxjs';

import { toContextRef } from '../../di';
import { ModuleBFF } from '../../modules/bff';
import { ModuleRemoveUserSettings } from '../../modules/userSettings/ModuleRemoveUserSettings';
import { ModuleSubscribeToUserSettings } from '../../modules/userSettings/ModuleSubscribeToUserSettings';
import { ModuleUpsertUserSettings } from '../../modules/userSettings/ModuleUpsertUserSettings';
import type { TSocketStruct } from '../../types/domain/sockets';
import { createActor } from '../../utils/Actors';
import {
    distinctValueDescriptorUntilChanged,
    tapValueDescriptor,
} from '../../utils/Rx/ValueDescriptor2';
import { isSyncedValueDescriptor } from '../../utils/ValueDescriptor/utils';
import { EActorName } from '../Root/defs';
import type { TSetSettings } from './actions';
import { deleteSettingsEnvBox, setSettingsEnvBox, settingsEnvBox } from './actions';
import { UserSettingsCache } from './UserSettingsCache';

const WAITING_TIME = 5000;

export function createActorSettings() {
    return createActor(EActorName.Settings, (context) => {
        const ctx = toContextRef(context);

        const { getCurrentBFFSocket$ } = ModuleBFF(ctx);

        const currentBffSocket = getCurrentBFFSocket$();

        const subscribeToUserSettings = ModuleSubscribeToUserSettings(ctx);
        const upsertUserSettings = ModuleUpsertUserSettings(ctx);
        const removeUserSettings = ModuleRemoveUserSettings(ctx);

        const cachedSettings = new UserSettingsCache();

        settingsEnvBox.responseStream(context, ({ appName, key }) => {
            return currentBffSocket.pipe(
                filter((target): target is TSocketStruct => !isNil(target)),
                switchMap((target) =>
                    subscribeToUserSettings(
                        {
                            type: EPlatformSocketRemoteProcedureName.SubscribeToUserSettings,
                            target: target,
                            filters: {
                                app: {
                                    appName,
                                    keys: [],
                                },
                            },
                        },
                        { traceId: generateTraceId() },
                    ),
                ),
                tapValueDescriptor({
                    synced: ({ value }) => {
                        cachedSettings.setAppCache(appName, value);
                    },
                    unsynced: (vd) => {
                        cachedSettings.setUnsyncedAppCache(appName, vd);
                    },
                }),
                switchMap((vd) => {
                    if (isSyncedValueDescriptor(vd)) {
                        return cachedSettings.cachedSettings(appName, key);
                    }

                    return of(vd);
                }),
                distinctValueDescriptorUntilChanged(isEqual),
            );
        });

        setSettingsEnvBox.responseStream(context, (settings) => {
            const isSingleSettings = !isArray(settings);
            const params = isArray(settings)
                ? {
                      settings,
                  }
                : {
                      settings: [{ ...settings }],
                  };
            return currentBffSocket.pipe(
                first((target): target is TSocketStruct => target !== undefined),
                switchMap((target) => {
                    if (isSingleSettings) {
                        const cachedValue = cachedSettings.getKeyCache(
                            settings.appName,
                            settings.key,
                        );

                        cachedSettings.upsertSingleSettings(settings);

                        return upsertUserSettings(
                            {
                                type: EPlatformSocketRemoteProcedureName.UpsertUserSettings,
                                target,
                                params,
                            },
                            { traceId: generateTraceId() },
                        ).pipe(
                            switchMap((vd) => {
                                if (isSyncedValueDescriptor(vd)) {
                                    return of(vd).pipe(
                                        switchMap(() => {
                                            return subscribeToUserSettings(
                                                {
                                                    type: EPlatformSocketRemoteProcedureName.SubscribeToUserSettings,
                                                    target: target,
                                                    filters: {
                                                        app: {
                                                            appName: settings.appName,
                                                            keys: [],
                                                        },
                                                    },
                                                },
                                                { traceId: generateTraceId() },
                                            ).pipe(
                                                filter(
                                                    (v) =>
                                                        isSyncedValueDescriptor(v) &&
                                                        isEqual(
                                                            v.value.find(
                                                                (el) =>
                                                                    el.appName ===
                                                                        settings.appName &&
                                                                    el.key === settings.key,
                                                            )?.value,
                                                            settings.value,
                                                        ),
                                                ),
                                                first(),
                                                map(() => vd),
                                            );
                                        }),
                                        timeout({
                                            each: WAITING_TIME,
                                            with: () => of(vd),
                                        }),
                                    );
                                }
                                return of(vd);
                            }),
                            catchError((err) => {
                                cachedSettings.rollbackSingleSettings({
                                    ...settings,
                                    value: cachedValue,
                                });

                                return throwError(err);
                            }),
                        );
                    } else {
                        const groupSettings = groupBy(settings, 'appName');

                        const cachedValues = settings.reduce<TSetSettings[]>((acc, curValue) => {
                            acc.push({
                                ...curValue,
                                value: cachedSettings.getKeyCache(curValue.appName, curValue.key),
                            });

                            return acc;
                        }, []);

                        const groupCachedSettings = groupBy(cachedValues, 'appName');

                        for (const appName in groupSettings) {
                            if (cachedSettings.hasApp(appName as EApplicationName)) {
                                cachedSettings.upsertSettings(
                                    appName as EApplicationName,
                                    groupSettings[appName],
                                );
                            }
                        }

                        return upsertUserSettings(
                            {
                                type: EPlatformSocketRemoteProcedureName.UpsertUserSettings,
                                target,
                                params,
                            },
                            { traceId: generateTraceId() },
                        ).pipe(
                            catchError((err) => {
                                for (const appName in groupCachedSettings) {
                                    if (cachedSettings.hasApp(appName as EApplicationName)) {
                                        cachedSettings.upsertSettings(
                                            appName as EApplicationName,
                                            groupCachedSettings[appName],
                                        );
                                    }
                                }
                                return throwError(err);
                            }),
                        );
                    }
                }),
            );
        });

        deleteSettingsEnvBox.responseStream(context, ({ appName, key }) => {
            return currentBffSocket.pipe(
                first((target): target is TSocketStruct => target !== undefined),
                switchMap((target) => {
                    const cachedKey = {
                        appName,
                        key,
                        value: cachedSettings.getKeyCache(appName, key),
                    };

                    cachedSettings.deleteSingleSettings({ appName, key });

                    return removeUserSettings(
                        {
                            type: EPlatformSocketRemoteProcedureName.RemoveUserSettings,
                            target,
                            filters: {
                                app: {
                                    appName,
                                    keys: [key],
                                },
                            },
                        },
                        { traceId: generateTraceId() },
                    ).pipe(
                        switchMap((vd) => {
                            if (isSyncedValueDescriptor(vd)) {
                                return of(vd).pipe(
                                    switchMap(() => {
                                        return subscribeToUserSettings(
                                            {
                                                type: EPlatformSocketRemoteProcedureName.SubscribeToUserSettings,
                                                target: target,
                                                filters: {
                                                    app: {
                                                        appName: appName,
                                                        keys: [],
                                                    },
                                                },
                                            },
                                            { traceId: generateTraceId() },
                                        ).pipe(
                                            filter(
                                                (v) =>
                                                    isSyncedValueDescriptor(v) &&
                                                    isNil(
                                                        v.value.find(
                                                            (el) =>
                                                                el.appName === appName &&
                                                                el.key === key,
                                                        )?.value,
                                                    ),
                                            ),
                                            first(),
                                            map(() => vd),
                                        );
                                    }),
                                    timeout({
                                        each: WAITING_TIME,
                                        with: () => of(vd),
                                    }),
                                );
                            }
                            return of(vd);
                        }),
                        catchError((err) => {
                            cachedSettings.rollbackSingleSettings(cachedKey);

                            return throwError(err);
                        }),
                    );
                }),
            );
        });
    });
}
