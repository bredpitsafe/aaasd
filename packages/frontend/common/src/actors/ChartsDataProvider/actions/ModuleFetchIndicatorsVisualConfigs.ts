import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import type { Minutes } from '@common/types';
import { minutes2milliseconds } from '@common/utils';

import type { TBacktestingRunId } from '../../../types/domain/backtestings';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';

type TIndicatorVisualConfigsKey = {
    name: string;
    stage?: string;
    btRunNo?: TBacktestingRunId;
};

type TFetchTimeseriesVisualConfigsRequest = {
    keys: TIndicatorVisualConfigsKey[];
};

type TTimeseriesVisualConfigs = {
    styler?: string;
    stylerDigest?: string;
    formatter?: string;
    formatterDigest?: string;
};

type TFetchTimeseriesVisualConfigsResponse = {
    configs: TTimeseriesVisualConfigs[];
};

const descriptor = createRemoteProcedureDescriptor<
    TFetchTimeseriesVisualConfigsRequest,
    TFetchTimeseriesVisualConfigsResponse
>()(EPlatformSocketRemoteProcedureName.FetchTimeseriesVisualConfigs, ERemoteProcedureType.Request);

export const ModuleFetchIndicatorsVisualConfigs = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        mapValueDescriptor(({ value }) => {
            return createSyncedValueDescriptor(value.payload.configs);
        }),
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
                keys: semanticHash.withSorter(null),
            }),
        resetDelay: minutes2milliseconds(10 as Minutes),
        removeDelay: minutes2milliseconds(10 as Minutes),
    },
});
