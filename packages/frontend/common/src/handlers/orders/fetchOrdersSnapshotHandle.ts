import { isUndefined } from 'lodash-es';
import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TBacktestingRunId } from '../../types/domain/backtestings';
import {
    EOrderSide,
    EOrderStatus,
    EOrderTimeInForce,
    TActiveOrder,
} from '../../types/domain/orders';
import { TRobotId } from '../../types/domain/robots';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { TFetchSnapshotParams, TFetchSortFieldsOrder } from '../def';
import { selectOnlyAvailableSortableFields } from './utils';

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
    type: 'FetchOrdersSnapshot';
    params: TFetchSnapshotParams;
    sort?: TOrdersSnapshotSort;
    filters?: TOrdersSnapshotFilters;
};

type TReceiveBody = {
    type: 'OrdersSnapshot';
    total: number;
    entities: TActiveOrder[];
};

export type TFetchedOrdersSnapshotProps = TFetchSnapshotParams & {
    sort?: TOrdersSnapshotSortOrder;
    filters?: TOrdersSnapshotFilters;
};

export function fetchOrdersSnapshotHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    props: TFetchedOrdersSnapshotProps,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[fetchOrdersSnapshotHandle]', {
        url,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchOrdersSnapshot',
            params: {
                offset: props.offset,
                limit: props.limit,
                withTotal: props.withTotal ?? false,
            },
            filters: props.filters,
            sort: {
                fieldsOrder: isUndefined(props.sort)
                    ? undefined
                    : selectOnlyAvailableSortableFields(props.sort),
            },
        },
        options,
    );
}
