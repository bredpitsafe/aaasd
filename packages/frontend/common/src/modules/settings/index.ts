import type { Observable } from 'rxjs';

import {
    deleteSettingsEnvBox,
    setSettingsEnvBox,
    settingsEnvBox,
} from '../../actors/Settings/actions';
import { TSettingsStoreName } from '../../actors/Settings/db';
import { ModuleFactory, TContextRef } from '../../di';
import { ModuleActor } from '../actor';
import { openModalSettings } from './openModalSettings';

function createModule(context: TContextRef) {
    const actor = ModuleActor(context);

    return {
        openModalSettings: openModalSettings.bind(undefined, context),
        setAppSettings<T>(storeName: TSettingsStoreName, key: string, value: T) {
            setSettingsEnvBox.send(actor, { storeName, key, value });
        },
        setCommonSettings<T>(key: string, value: T) {
            setSettingsEnvBox.send(actor, { storeName: undefined, key, value });
        },
        getAppSettings$<T>(storeName: TSettingsStoreName, key: string): Observable<T | undefined> {
            return settingsEnvBox.requestStream(actor, {
                storeName,
                key,
            }) as Observable<T | undefined>;
        },
        getCommonSettings$<T>(key: string): Observable<T | undefined> {
            return settingsEnvBox.requestStream(actor, {
                storeName: undefined,
                key,
            }) as Observable<T | undefined>;
        },
        deleteAppSettings(storeName: TSettingsStoreName, key: string) {
            deleteSettingsEnvBox.send(actor, { storeName, key });
        },
        deleteCommonSettings(storeName: TSettingsStoreName, key: string) {
            deleteSettingsEnvBox.send(actor, { storeName, key });
        },
    };
}

export type IModuleSettings = ReturnType<typeof createModule>;

export const ModuleSettings = ModuleFactory(createModule);
