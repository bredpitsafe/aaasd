import { TBacktestingRunId } from '../../../types/domain/backtestings';
import { Minutes } from '../../../types/time';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { EBffSocketRemoteProcedureName, ERemoteProcedureType } from '../../../utils/RPC/defs';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { minutes2milliseconds } from '../../../utils/time';
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
>()(EBffSocketRemoteProcedureName.FetchTimeseriesVisualConfigs, ERemoteProcedureType.Request);

export const ModuleFetchIndicatorsVisualConfigs = createRemoteProcedureCall(descriptor)({
    getParams: (props: TIndicatorVisualConfigsKey[]) => {
        return { keys: props };
    },
    getPipe: () =>
        mapValueDescriptor(({ value }) => {
            return createSyncedValueDescriptor(value.payload.configs);
        }),
    dedobs: {
        resetDelay: minutes2milliseconds(10 as Minutes),
        removeDelay: minutes2milliseconds(10 as Minutes),
    },
});
