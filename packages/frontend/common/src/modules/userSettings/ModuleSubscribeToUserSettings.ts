import { ERpcSubscriptionEvent } from '@backend/bff/src/def/rpc';
import type {
    TSubscribeToUserSettingsRequestPayload,
    TSubscribeToUserSettingsResponsePayload,
} from '@backend/bff/src/modules/userSettings/schemas/SubscribeToUserSettings.schema';
import {
    createRemoteProcedureDescriptor,
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@common/rpc';
import { assertNever } from '@common/utils/src/assert.ts';
import { lowerCaseComparator } from '@frontend/ag-grid/src/comparators/lowerCaseComparator';
import type { TUserSetting } from '@grpc-schemas/user_settings-api-sdk/index.services.user_settings.v1.js';
import { isEmpty } from 'lodash-es';
import type { OperatorFunction } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables';
import type { TReceivedData } from '../../lib/BFFSocket/def';
import { getSocketUrlHash } from '../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import { semanticHash } from '../../utils/semanticHash';
import {
    getCachedArrayFromUnifier,
    UnifierWithCompositeHash,
} from '../../utils/unifierWithCompositeHash';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
    WAITING_VD,
} from '../../utils/ValueDescriptor/utils';

export const subscriptionDescriptor = createRemoteProcedureDescriptor<
    TSubscribeToUserSettingsRequestPayload,
    TSubscribeToUserSettingsResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToUserSettings, ERemoteProcedureType.Subscribe);

export const ModuleSubscribeToUserSettings = createRemoteProcedureCall(subscriptionDescriptor)({
    getPipe: (): OperatorFunction<
        TValueDescriptor2<TReceivedData<TSubscribeToUserSettingsResponsePayload>>,
        TValueDescriptor2<TUserSetting[]>
    > => {
        const cache = new UnifierWithCompositeHash<TUserSetting>('id', {
            removePredicate: (item) => !('key' in item),
        });

        return mapValueDescriptor((desc) => {
            if (!isSyncedValueDescriptor(desc)) {
                return desc;
            }

            const { payload } = desc.value;
            const { type } = payload;

            if (type === ERpcSubscriptionEvent.Ok) {
                cache.clear();
                return WAITING_VD;
            }

            switch (type) {
                case ERpcSubscriptionEvent.Snapshot:
                    if (!isEmpty(payload.entities)) {
                        cache.modify(payload.entities);
                    }
                    break;
                case ERpcSubscriptionEvent.Updates:
                    if (!isEmpty(payload.removed)) {
                        cache.modify(payload.removed as TUserSetting[]);
                    }

                    if (!isEmpty(payload.upserted)) {
                        cache.modify(payload.upserted);
                    }

                    break;
                default:
                    assertNever(type);
            }

            const cachedEntities = getCachedArrayFromUnifier(cache);

            return createSyncedValueDescriptor(cachedEntities);
        });
    },
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filters: { app: { keys: semanticHash.withSorter(lowerCaseComparator) } },
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
