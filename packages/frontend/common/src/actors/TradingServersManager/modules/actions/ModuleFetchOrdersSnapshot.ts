import { isUndefined } from 'lodash-es';

import type {
    TFetchSnapshotParams,
    TFetchSortFieldsOrder,
} from '../../../../modules/actions/def.ts';
import type { TBacktestingRunId } from '../../../../types/domain/backtestings.ts';
import type {
    EOrderSide,
    EOrderStatus,
    EOrderTimeInForce,
    TActiveOrder,
} from '../../../../types/domain/orders.ts';
import type { TRobotId } from '../../../../types/domain/robots.ts';
import type { TWithSocketTarget } from '../../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../../utils/ValueDescriptor/utils.ts';
import { selectOnlyAvailableSortableFields } from './utils.ts';

export type TOrdersSortablePart = Pick<
    TActiveOrder,
    | 'platformTime'
    | 'accountId'
    | 'accountName'
    | 'robotId'
    | 'robotName'
    | 'orderId'
    | 'instrumentId'
    | 'instrumentName'
    | 'gateId'
    | 'gateName'
    | 'price'
    | 'strategy'
    | 'status'
    | 'statusReason'
>;

export type TOrdersSnapshotSortOrder = TFetchSortFieldsOrder<TOrdersSortablePart>;
export type TOrdersSnapshotFilters = {
    btRunNo?: TBacktestingRunId;
    robotIds?: TRobotId[];
    statuses?: EOrderStatus[];
    side?: EOrderSide;
    timeInForce?: EOrderTimeInForce;
    gateName?: string;
    accountName?: string;
    instrumentName?: string;
};

type TOrdersSnapshotSort = {
    fieldsOrder?: TOrdersSnapshotSortOrder;
};

type TSendBody = {
    params: TFetchSnapshotParams;
    sort?: TOrdersSnapshotSort;
    filters?: TOrdersSnapshotFilters;
};

type TReceiveBody = {
    type: 'OrdersSnapshot';
    total: number;
    entities: TActiveOrder[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchOrdersSnapshot,
    ERemoteProcedureType.Request,
);

export const ModuleFetchOrdersSnapshot = createRemoteProcedureCall(descriptor)({
    getParams: (
        props: TWithSocketTarget & {
            params: TFetchSnapshotParams;
            sort?: TOrdersSnapshotSortOrder;
            filters?: TOrdersSnapshotFilters;
        },
    ) => {
        return {
            target: props.target,
            params: props.params,
            filters: props.filters,
            sort: {
                fieldsOrder: isUndefined(props.sort)
                    ? undefined
                    : selectOnlyAvailableSortableFields(props.sort),
            },
        };
    },
    getPipe: () => {
        return mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload));
    },
});
