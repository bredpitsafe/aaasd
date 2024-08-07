import { ERpcSubscriptionEvent } from '@backend/bff/src/def/rpc';
import type {
    TPolicy,
    TPolicyFilterFilter,
    TSubscribeToPolicySnapshotRequestPayload,
    TSubscribeToPolicySnapshotResponsePayload,
} from '@backend/bff/src/modules/authorization/schemas/SubscribeToPolicySnapshot.schema';
import { assertNever } from '@common/utils';
import { lowerCaseComparator } from '@common/utils/src/comporators/lowerCaseComparator';
import { incNumericalComparator } from '@common/utils/src/comporators/numericalComparator';
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
import type { THashDescriptor } from '@frontend/common/src/utils/semanticHash.ts';
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

const POLICY_FILTER_HASH_DESCRIPTOR: THashDescriptor<TPolicyFilterFilter> = {
    ids: semanticHash.withSorter(incNumericalComparator),
    template: {
        names: semanticHash.withSorter(lowerCaseComparator),
        permissionNames: semanticHash.withSorter(lowerCaseComparator),
    },
};

const descriptor = createRemoteProcedureDescriptor<
    TSubscribeToPolicySnapshotRequestPayload,
    TSubscribeToPolicySnapshotResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToPolicySnapshot, ERemoteProcedureType.Subscribe);

const ModuleSubscribeToPoliciesHandler = createRemoteProcedureCall(descriptor)({
    getParams: (
        params: Pick<Partial<TSubscribeToPolicySnapshotRequestPayload>, 'filters'> &
            TWithSocketTarget,
    ) => ({
        target: params.target,
        type: EPlatformSocketRemoteProcedureName.SubscribeToPolicySnapshot,
        filters: params.filters ?? {},
    }),
    getPipe: () => {
        const cache = new UnifierWithCompositeHash<TPolicy>('id', {
            removePredicate: (item) => isNil(item.templateName),
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
                        cache.modify(payload.removed as TPolicy[]);
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

export const ModuleSubscribeToPoliciesSnapshot = createModuleSubscriptionWithCurrentBFFStage(
    ModuleSubscribeToPoliciesHandler,
    {
        dedobs: {
            normalize: ([props]) =>
                semanticHash.get(props, {
                    filters: {
                        include: POLICY_FILTER_HASH_DESCRIPTOR,
                        exclude: POLICY_FILTER_HASH_DESCRIPTOR,
                    },
                }),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
