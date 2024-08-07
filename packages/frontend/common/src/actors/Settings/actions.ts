import type { TRemoveUserSettingsResponsePayload } from '@backend/bff/src/modules/userSettings/schemas/RemoveUserSettings.schema';
import type { EApplicationName, TStructurallyCloneable } from '@common/types';

import { createActorObservableBox } from '../../utils/Actors/observable';
import type { TPlatformSocketReceive } from '../../utils/RPC/types';
import type {
    TUnsyncedValueDescriptor,
    TValueDescriptor2,
} from '../../utils/ValueDescriptor/types';

export type TGetSettings = {
    appName: EApplicationName;
    key: string;
};

export type TSetSettings = TGetSettings & {
    value: TStructurallyCloneable;
};

export const setSettingsEnvBox = createActorObservableBox<TSetSettings | TSetSettings[], any>()(
    'SET_SETTINGS',
);
export const deleteSettingsEnvBox = createActorObservableBox<
    TGetSettings,
    TPlatformSocketReceive<TRemoveUserSettingsResponsePayload> | TUnsyncedValueDescriptor
>()('DELETE_SETTINGS');

export const settingsEnvBox = createActorObservableBox<
    {
        appName: EApplicationName;
        key: string;
    },
    TValueDescriptor2<TStructurallyCloneable>
>()('GET_SETTINGS');
