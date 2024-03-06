import { TFetchedOrdersSnapshotProps } from '../../handlers/orders/fetchOrdersSnapshotHandle';
import { THandlerOptions } from '../../modules/communicationHandlers/def';
import { TActiveOrder } from '../../types/domain/orders';
import { TSocketURL } from '../../types/domain/sockets';
import { createActorObservableBox } from '../../utils/Actors/observable';
import { createActorRequestBox } from '../../utils/Actors/request';
import { TSubscriptionEvent } from '../../utils/Rx/subscriptionEvents';
import { TGetComponentStateProps, TGetComponentStateReturnType } from './actions/getComponentState';
import {
    TGetComponentStateRevisionProps,
    TGetComponentStateRevisionReturnType,
} from './actions/getComponentStateRevision';
import {
    TGetComponentStateRevisionsProps,
    TGetComponentStateRevisionsReturnType,
} from './actions/getComponentStateRevisions';
import { TGetGateKindsParams, TGetGateKindsResult } from './actions/getGateKinds';

export const getComponentStateRevisionEnvBox = createActorObservableBox<
    TGetComponentStateRevisionProps,
    TGetComponentStateRevisionReturnType
>()('getComponentStateRevisionEnvBox');

export const getComponentStateRevisionsEnvBox = createActorObservableBox<
    TGetComponentStateRevisionsProps,
    TGetComponentStateRevisionsReturnType
>()('getComponentStateRevisionsEnvBox');

export const getComponentStateEnvBox = createActorObservableBox<
    TGetComponentStateProps,
    TGetComponentStateReturnType
>()('getComponentStateEnvBox');

export const getGateKindsEnvBox = createActorObservableBox<
    TGetGateKindsParams,
    TGetGateKindsResult
>()('getGateKindsEnvBox');

export const requestOrdersItemsEnvBox = createActorRequestBox<
    {
        url: TSocketURL;
        props: TFetchedOrdersSnapshotProps;
        options: THandlerOptions;
    },
    Array<TActiveOrder>
>()(`REQUEST_ORDERS_ITEMS`);

export const subscribeToOrdersUpdatesEnvBox = createActorObservableBox<
    {
        url: TSocketURL;
        props: Omit<TFetchedOrdersSnapshotProps, 'limit' | 'offset'>;
        options: THandlerOptions;
    },
    TSubscriptionEvent<TActiveOrder[]>
>()(`SUBSCRIBE_TO_ORDERS_UPDATES`);
