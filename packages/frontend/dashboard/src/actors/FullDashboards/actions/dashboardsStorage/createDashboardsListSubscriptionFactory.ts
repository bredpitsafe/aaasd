import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { lowerCaseComparator } from '@common/utils/src/comporators/lowerCaseComparator.ts';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TRequestStreamOptions } from '@frontend/common/src/modules/actions/def.ts';
import type {
    TScope,
    TStorageDashboardListItem,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { getSocketUrlHash } from '@frontend/common/src/utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import { convertDashboardStorageErrorToGrpcError } from './utils.ts';

type TSendBody = TRequestStreamOptions;
export type TSubscribeToDashboardsListParams = {
    filters?: {
        include?: {
            scopes?: (TScope | null)[];
        };
        exclude?: {
            scopes?: (TScope | null)[];
        };
    };
};

type TReceiveBody = {
    type: 'DashboardsList';
    list: TStorageDashboardListItem[];
};

// TODO: rename everything from SubscribeToDashboardsList to SubscribeToDashboardList
const descriptor = createRemoteProcedureDescriptor<
    TSendBody & TSubscribeToDashboardsListParams,
    TReceiveBody
>()(EPlatformSocketRemoteProcedureName.SubscribeToDashboardsList, ERemoteProcedureType.Subscribe);

const ModuleServerSubscribeToDashboardList = createRemoteProcedureCall(descriptor)({
    getParams: (props) => {
        return {
            filters: props.filters,
            target: props.target,
        };
    },
    getPipe: () => {
        return pipe(
            convertDashboardStorageErrorToGrpcError(),
            mapValueDescriptor(({ value: envelope }) =>
                createSyncedValueDescriptor(envelope.payload.list),
            ),
        );
    },
    dedobs: {
        normalize: ([props]) =>
            semanticHash.get(props, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filters: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TSubscribeToDashboardsListParams['filters']>(
                        (filters) =>
                            semanticHash.get(filters, {
                                include: {
                                    scopes: semanticHash.withSorter(lowerCaseComparator),
                                },
                                exclude: {
                                    scopes: semanticHash.withSorter(lowerCaseComparator),
                                },
                            }),
                    ),
                },
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

export const ModuleSubscribeToDashboardsList = createObservableProcedure<
    TSendBody & TSubscribeToDashboardsListParams,
    TValueDescriptor2<TStorageDashboardListItem[]>
>(
    (ctx) => {
        const { currentStage$ } = ModuleServiceStage(ctx);
        const subscribe = ModuleServerSubscribeToDashboardList(ctx);

        return (params, options) => {
            return currentStage$.pipe(
                switchMap((stage) => subscribe({ ...params, target: stage.url }, options)),
            );
        };
    },
    {
        dedobs: {
            normalize: ([props]) =>
                semanticHash.get(props, {
                    filters: {
                        ...semanticHash.withNullable(isDeepObjectEmpty),
                        ...semanticHash.withHasher<TSubscribeToDashboardsListParams['filters']>(
                            (filters) =>
                                semanticHash.get(filters, {
                                    include: {
                                        scopes: semanticHash.withSorter(lowerCaseComparator),
                                    },
                                    exclude: {
                                        scopes: semanticHash.withSorter(lowerCaseComparator),
                                    },
                                }),
                        ),
                    },
                }),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
