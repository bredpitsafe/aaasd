import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import type { ISO } from '@common/types';
import { toMilliseconds } from '@common/utils';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { lowerCaseComparator } from '@common/utils/src/comporators/lowerCaseComparator.ts';
import { incNumericalComparator } from '@common/utils/src/comporators/numericalComparator.ts';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type {
    THandlerStreamOptions,
    TRequestStreamOptions,
    TSubscribed,
    TWithSnapshot,
} from '../../../modules/actions/def.ts';
import type { TIndicator } from '../../../modules/actions/indicators/defs.ts';
import { pollIntervalForRequest } from '../../../modules/actions/utils.ts';
import type { TBacktestingRunId } from '../../../types/domain/backtestings.ts';
import type { TSocketStruct, TSocketURL } from '../../../types/domain/sockets.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
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
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filters: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TSubscribeToIndicatorsProps | undefined>((filters) =>
                        semanticHash.get(filters, {
                            names: semanticHash.withSorter(lowerCaseComparator),
                            nameRegexes: semanticHash.withSorter(lowerCaseComparator),
                            btRuns: semanticHash.withSorter(incNumericalComparator),
                        }),
                    ),
                },
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
