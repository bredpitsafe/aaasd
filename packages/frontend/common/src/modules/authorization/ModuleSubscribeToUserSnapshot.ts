import { ERpcSubscriptionEvent } from '@backend/bff/src/def/rpc';
import type {
    TSubscribeToUserSnapshotRequestPayload,
    TSubscribeToUserSnapshotResponsePayload,
    TUser,
} from '@backend/bff/src/modules/authorization/schemas/SubscribeToUserSnapshot.schema.ts';
import { assertNever } from '@common/utils';
import { lowerCaseComparator } from '@frontend/ag-grid/src/comparators/lowerCaseComparator';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { createModuleSubscriptionWithCurrentBFFStage } from '@frontend/common/src/modules/bff/utils';
import type { TWithSocketTarget } from '@frontend/common/src/types/domain/sockets';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { semanticHash } from '@frontend/common/src/utils/semanticHash';
import {
    getCachedArrayFromUnifier,
    UnifierWithCompositeHash,
} from '@frontend/common/src/utils/unifierWithCompositeHash';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isEmpty, isNil } from 'lodash-es';

const descriptor = createRemoteProcedureDescriptor<
    TSubscribeToUserSnapshotRequestPayload,
    TSubscribeToUserSnapshotResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToUserSnapshot, ERemoteProcedureType.Subscribe);

const ModuleSubscribeToUserSnapshotHandler = createRemoteProcedureCall(descriptor)({
    getParams: (
        params: Pick<Partial<TSubscribeToUserSnapshotRequestPayload>, 'filters'> &
            TWithSocketTarget,
    ) => ({
        target: params.target,
        type: EPlatformSocketRemoteProcedureName.SubscribeToUserSnapshot,
        filters: params.filters ?? {},
    }),
    getPipe: () => {
        const cache = new UnifierWithCompositeHash<TUser>('name', {
            removePredicate: (item) => isNil(item.groups),
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
                    if (!isEmpty(payload.snapshot)) {
                        cache.modify(payload.snapshot);
                    }
                    break;
                case ERpcSubscriptionEvent.Updates:
                    if (!isEmpty(payload.removed)) {
                        cache.modify(payload.removed as TUser[]);
                    }

                    if (!isEmpty(payload.upserted)) {
                        cache.modify(payload.upserted!);
                    }

                    break;
                default:
                    assertNever(type as never);
            }

            const cachedEntities = getCachedArrayFromUnifier(cache);

            return createSyncedValueDescriptor(cachedEntities);
        });
    },
});

export const ModuleSubscribeToUserSnapshot = createModuleSubscriptionWithCurrentBFFStage(
    ModuleSubscribeToUserSnapshotHandler,
    {
        dedobs: {
            normalize: ([params]) =>
                isEmpty(params.filters)
                    ? 0
                    : semanticHash.get(params.filters, {
                          include: {
                              names: semanticHash.withSorter(lowerCaseComparator),
                              groups: semanticHash.withSorter(lowerCaseComparator),
                          },
                          exclude: {
                              names: semanticHash.withSorter(lowerCaseComparator),
                              groups: semanticHash.withSorter(lowerCaseComparator),
                          },
                      }),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
