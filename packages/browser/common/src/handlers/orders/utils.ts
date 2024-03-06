import { TActiveOrder } from '../../types/domain/orders';
import { TOrdersSnapshotSortOrder } from './fetchOrdersSnapshotHandle';

export const ordersSortableFields: (keyof TActiveOrder)[] = [
    'platformTime',
    'accountId',
    'accountName',
    'robotId',
    'robotName',
    'orderId',
    'instrumentId',
    'instrumentName',
    'gateId',
    'gateName',
    'price',
    'strategy',
    'status',
    'statusReason',
];

export function selectOnlyAvailableSortableFields(sort: TOrdersSnapshotSortOrder) {
    return sort.filter(([field]) => ordersSortableFields.includes(field));
}
