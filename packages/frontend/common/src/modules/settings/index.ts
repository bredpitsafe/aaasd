import type { TRemoveUserSettingsResponsePayload } from '@backend/bff/src/modules/userSettings/schemas/RemoveUserSettings.schema';
import type { TUpsertUserSettingsResponsePayload } from '@backend/bff/src/modules/userSettings/schemas/UpsertUserSettings.schema';
import type { EApplicationName, TStructurallyCloneable } from '@common/types';
import { type Observable } from 'rxjs';

import type { TSetSettings } from '../../actors/Settings/actions';
import {
    deleteSettingsEnvBox,
    setSettingsEnvBox,
    settingsEnvBox,
} from '../../actors/Settings/actions';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables';
import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import { dedobs } from '../../utils/observable/memo';
import type { TPlatformSocketReceive } from '../../utils/RPC/types';
import { shallowHash } from '../../utils/shallowHash';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types.ts';
import { ModuleActor } from '../actor';
import { openModalSettings } from './openModalSettings';

function createModule(context: TContextRef) {
    const actor = ModuleActor(context);

    return {
        openModalSettings: openModalSettings.bind(undefined, context),
        setAppSettings(
            settings: TSetSettings | TSetSettings[],
        ): Observable<TPlatformSocketReceive<TUpsertUserSettingsResponsePayload>> {
            return setSettingsEnvBox.requestStream(actor, settings);
        },
        getAppSettings$: dedobs(
            (
                appName: EApplicationName,
                key: string,
            ): Observable<TValueDescriptor2<TStructurallyCloneable>> => {
                return settingsEnvBox.requestStream(actor, {
                    appName,
                    key,
                });
            },
            {
                normalize: ([appName, key]) => shallowHash(appName, key),
                resetDelay: SHARE_RESET_DELAY,
                removeDelay: DEDUPE_REMOVE_DELAY,
            },
        ),
        deleteAppSettings(
            appName: EApplicationName,
            key: string,
        ): Observable<TPlatformSocketReceive<TRemoveUserSettingsResponsePayload>> {
            return deleteSettingsEnvBox.requestStream(actor, { appName, key });
        },
    };
}

export type IModuleSettings = ReturnType<typeof createModule>;

export const ModuleSettings = ModuleFactory(createModule);
