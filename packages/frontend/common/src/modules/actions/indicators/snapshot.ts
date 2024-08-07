import { lowerCaseComparator } from '@frontend/ag-grid/src/comparators/lowerCaseComparator.ts';

import {
    fetchIndicatorsInfinitySnapshotProcedureDescriptor,
    subscribeToIndicatorsFiniteSnapshotProcedureDescriptor,
    subscribeToIndicatorsInfinitySnapshotProcedureDescriptor,
} from '../../../actors/IndicatorsDataProvider/descriptors.ts';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { semanticHash } from '../../../utils/semanticHash.ts';

export const ModuleFetchIndicatorsInfinitySnapshot = createRemoteProcedureCall(
    fetchIndicatorsInfinitySnapshotProcedureDescriptor,
)({
    // dont use dedobs, because response relative to time
});

export const ModuleSubscribeToIndicatorsInfinitySnapshot = createRemoteProcedureCall(
    subscribeToIndicatorsInfinitySnapshotProcedureDescriptor,
)({
    // dont use dedobs, because response relative to time
});

export const ModuleSubscribeToIndicatorsFiniteSnapshot = createRemoteProcedureCall(
    subscribeToIndicatorsFiniteSnapshotProcedureDescriptor,
)({
    dedobs: {
        normalize: ([query]) =>
            semanticHash.get(query, {
                btRuns: semanticHash.withSorter(lowerCaseComparator),
                names: semanticHash.withSorter(lowerCaseComparator),
                nameRegexes: semanticHash.withSorter(lowerCaseComparator),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
