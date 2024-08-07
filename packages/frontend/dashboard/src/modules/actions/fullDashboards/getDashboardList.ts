import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { lowerCaseComparator } from '@common/utils/src/comporators/lowerCaseComparator';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { semanticHash } from '@frontend/common/src/utils/semanticHash';

import type { TSubscribeToDashboardsListParams } from '../../../actors/FullDashboards/actions/dashboardsStorage/createDashboardsListSubscriptionFactory.ts';
import { getDashboardsListProcedureDescriptor } from '../../../actors/FullDashboards/descriptors';

export const ModuleGetDashboardList = createRemoteProcedureCall(
    getDashboardsListProcedureDescriptor,
)({
    getParams: (params) => params ?? {},
    dedobs: {
        normalize: ([props]) =>
            props
                ? semanticHash.get(props, {
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
                  })
                : 0,
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
