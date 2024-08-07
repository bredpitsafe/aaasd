import type { EApplicationName, TStructurallyCloneable } from '@common/types';
import type { TUserSetting } from '@grpc-schemas/user_settings-api-sdk/index.services.user_settings.v1.js';
import { isNil } from 'lodash-es';
import { BehaviorSubject, map } from 'rxjs';

import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
    WAITING_VD,
} from '../../utils/ValueDescriptor/utils';
import type { TGetSettings, TSetSettings } from './actions';

export class UserSettingsCache {
    private readonly cache: BehaviorSubject<
        Map<EApplicationName, TValueDescriptor2<Map<string, TStructurallyCloneable>>>
    >;

    constructor(cache = new BehaviorSubject(new Map())) {
        this.cache = cache;
    }

    getCache() {
        return this.cache.getValue();
    }

    private valuesToMap(values: TUserSetting[]) {
        return values.reduce<Map<string, TStructurallyCloneable>>((acc, cur) => {
            acc.set(cur.key, cur.value);
            return acc;
        }, new Map());
    }

    setAppCache(appName: EApplicationName, values: TUserSetting[]) {
        const newMap = new Map(this.getCache());
        newMap.set(appName, createSyncedValueDescriptor(this.valuesToMap(values)));

        this.next(newMap);
    }

    setUnsyncedAppCache(
        appName: EApplicationName,
        vd: TValueDescriptor2<Map<string, TStructurallyCloneable>>,
    ) {
        const newMap = new Map(this.getCache());
        newMap.set(appName, vd);
        this.next(newMap);
    }

    getAppCache(appName: EApplicationName): TValueDescriptor2<Map<string, TStructurallyCloneable>> {
        if (isNil(this.cache.getValue().get(appName))) {
            const newMap = new Map(this.getCache());
            newMap.set(appName, WAITING_VD);
            this.cache.next(newMap);
        }
        return this.cache.getValue().get(appName) as TValueDescriptor2<
            Map<string, TStructurallyCloneable>
        >;
    }

    getKeyCache(appName: EApplicationName, key: string) {
        return this.cache.getValue().get(appName)?.value?.get(key);
    }

    getKeyCache$(appName: EApplicationName, key: string) {
        return this.cache.pipe(map((v) => v.get(appName)?.value?.get(key)));
    }

    next(vd: Map<EApplicationName, TValueDescriptor2<Map<string, TStructurallyCloneable>>>) {
        this.cache.next(vd);
    }

    cachedSettings(appName: EApplicationName, key: string) {
        return this.cache.pipe(
            map((cache) => {
                const cachedVd = cache.get(appName);
                if (isNil(cachedVd)) {
                    return WAITING_VD;
                }

                if (isSyncedValueDescriptor(cachedVd)) {
                    return createSyncedValueDescriptor(cachedVd.value?.get(key) ?? null);
                }

                return cachedVd;
            }),
        );
    }

    upsertSingleSettings({ appName, key, value }: TSetSettings) {
        const appCache = this.getAppCache(appName);

        appCache?.value?.set(key, value);

        const newCache = new Map(this.getCache());

        newCache.set(appName, appCache);
        this.next(newCache);
    }

    rollbackSingleSettings({ appName, key, value }: TSetSettings) {
        const appCache = this.getAppCache(appName);

        if (!isNil(appCache) && isSyncedValueDescriptor(appCache)) {
            appCache?.value?.set(key, value);

            const prevCache = new Map(this.getCache());

            prevCache.set(appName, appCache);
            this.next(prevCache);
        }
    }

    deleteSingleSettings({ appName, key }: TGetSettings) {
        const appCache = this.getAppCache(appName);

        appCache?.value?.set(key, undefined);

        const newCache = new Map(this.getCache());

        newCache.set(appName, appCache);
        this.next(newCache);
    }

    hasApp(appName: EApplicationName) {
        return this.cache.getValue().has(appName);
    }

    upsertSettings(appName: EApplicationName, settings: TSetSettings[]) {
        const appCache = this.getAppCache(appName);

        settings.forEach(({ key, value }) => {
            appCache?.value?.set(key, value);
        });

        const newCache = new Map(this.getCache());

        newCache.set(appName, appCache);
        this.next(newCache);
    }
}
