import { ERpcSubscriptionEvent } from '@backend/bff/src/def/rpc';
import type {
    TGroup,
    TSubscribeToGroupSnapshotRequestPayload,
    TSubscribeToGroupSnapshotResponsePayload,
} from '@backend/bff/src/modules/authorization/schemas/SubscribeToGroupSnapshot.schema';
import { assertNever } from '@common/utils';
import { lowerCaseComparator } from '@common/utils/src/comporators/lowerCaseComparator.ts';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import { createModuleSubscriptionWithCurrentBFFStage } from '@frontend/common/src/modules/bff/utils.ts';
import type { TWithSocketTarget } from '@frontend/common/src/types/domain/sockets';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
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
    TSubscribeToGroupSnapshotRequestPayload,
    TSubscribeToGroupSnapshotResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToGroupSnapshot, ERemoteProcedureType.Subscribe);

const ModuleSubscribeToGroupsHandler = createRemoteProcedureCall(descriptor)({
    getParams: (
        params: Pick<Partial<TSubscribeToGroupSnapshotRequestPayload>, 'filters'> &
            TWithSocketTarget,
    ) => ({
        target: params.target,
        type: EPlatformSocketRemoteProcedureName.SubscribeToGroupSnapshot,
        filters: params.filters ?? {},
    }),
    getPipe: () => {
        const cache = new UnifierWithCompositeHash<TGroup>('name', {
            removePredicate: (item) => isNil(item.policies),
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
                        cache.modify(payload.removed as TGroup[]);
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

export const ModuleSubscribeToGroupsSnapshot = createModuleSubscriptionWithCurrentBFFStage(
    ModuleSubscribeToGroupsHandler,
    {
        dedobs: {
            normalize: ([props]) =>
                semanticHash.get(props, {
                    filters: {
                        include: {
                            names: semanticHash.withSorter(lowerCaseComparator),
                            users: semanticHash.withSorter(lowerCaseComparator),
                        },
                        exclude: {
                            names: semanticHash.withSorter(lowerCaseComparator),
                            users: semanticHash.withSorter(lowerCaseComparator),
                        },
                    },
                }),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
