import type { ISO } from '@common/types';
import { assign, omit, pick } from 'lodash-es';

import type { TFetchSortFieldsOrder } from '../../../modules/actions/def.ts';
import type { TIndicator } from '../../../modules/actions/indicators/defs.ts';
import type { TBacktestingRunId } from '../../../types/domain/backtestings.ts';
import type { TSocketStruct, TSocketURL } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import { modifyIndicators } from './utils';

export type TFetchIndicatorsSnapshotParams = {
    limit: number;
    offset: number;
    withTotals?: boolean;
};

export type TFetchIndicatorsSnapshotFilters = {
    btRuns?: TBacktestingRunId[];
    names?: string[];
    nameRegexes?: string[];
    // if not defined will be returned latest (actual) snapshot, if defined historical snapshot will be returned.
    platformTime?: ISO;
    minUpdateTime?: ISO;
};

export type TFetchIndicatorsSnapshotSort = {
    fieldsOrder?: TFetchSortFieldsOrder<TIndicator>;
};

export type TFetchIndicatorsSnapshotProps = {
    params: TFetchIndicatorsSnapshotParams;
    filters?: TFetchIndicatorsSnapshotFilters;
    sort?: TFetchIndicatorsSnapshotSort;
};

type TSendBody = {
    params: TFetchIndicatorsSnapshotParams & Pick<TFetchIndicatorsSnapshotFilters, 'platformTime'>;
    filters?: Omit<TFetchIndicatorsSnapshotFilters, 'platformTime'>;
    sort?: TFetchIndicatorsSnapshotSort;
};

export type TIndicatorsSnapshot = {
    type: 'IndicatorsSnapshot';
    checkedIntervalStart: ISO;
    checkedIntervalEnd: ISO;
    total: null | number;
    entities: TIndicator[];
};

type TReceiveBody = TIndicatorsSnapshot;

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchIndicatorsSnapshot,
    ERemoteProcedureType.Request,
);

export const ModuleFetchIndicatorsSnapshot = createRemoteProcedureCall(descriptor)({
    getParams: (props: TFetchIndicatorsSnapshotProps & { target: TSocketURL | TSocketStruct }) => {
        return {
            target: props.target,
            params: assign(
                props.params,
                pick(props.filters, 'platformTime'),
            ) as TSendBody['params'],
            filters: omit(props.filters, 'platformTime') as TSendBody['filters'],
            sort: props.sort,
        };
    },
    getPipe: (params) => {
        return mapValueDescriptor(({ value }) => {
            modifyIndicators(value.payload.entities, params.target);
            return createSyncedValueDescriptor(value);
        });
    },
});
