import {
    THandlerStreamOptions,
    TRequestStreamOptions,
    TSubscribed,
    TWithSnapshot,
} from '../../../handlers/def.ts';
import { pollIntervalForRequest } from '../../../handlers/utils.ts';
import { TIndicator } from '../../../modules/actions/indicators/defs.ts';
import { TBacktestingRunId } from '../../../types/domain/backtestings.ts';
import { TSocketStruct, TSocketURL } from '../../../types/domain/sockets.ts';
import { ISO } from '../../../types/time.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { toMilliseconds } from '../../../utils/time.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import { modifyIndicators } from './utils';

export type TSubscribeToIndicatorsProps = {
    names?: string[];
    nameRegexes?: string[];
    btRuns?: Array<TBacktestingRunId>;
    minUpdateTime?: ISO;
};

export type TIndicatorsUpdate = TWithSnapshot & {
    type: 'Indicators';
    indicators: TIndicator[];
};

type TSendBody = TRequestStreamOptions &
    TSubscribeToIndicatorsProps & {
        updatesOnly?: boolean;
    };

type TReceiveBody = TIndicatorsUpdate | TSubscribed;

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToIndicators,
    ERemoteProcedureType.Subscribe,
);

export const ModuleToSubscribeToIndicators = createRemoteProcedureCall(descriptor)({
    getParams: (
        props: {
            target: TSocketURL | TSocketStruct;
            filters?: TSubscribeToIndicatorsProps;
        } & Pick<THandlerStreamOptions, 'updatesOnly' | 'pollInterval'>,
    ) => {
        return {
            ...props.filters,
            target: props.target,
            updatesOnly: props?.updatesOnly,
            pollInterval: pollIntervalForRequest(props.pollInterval ?? toMilliseconds(1000)),
        };
    },
    getPipe: (params) => {
        return mapValueDescriptor(({ value }) => {
            if (value.payload.type === 'Indicators') {
                modifyIndicators(value.payload.indicators, params.target);
            }
            return createSyncedValueDescriptor(value);
        });
    },
});
