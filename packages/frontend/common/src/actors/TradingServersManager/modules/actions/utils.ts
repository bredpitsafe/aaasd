import type { TActiveOrder } from '../../../../types/domain/orders.ts';
import type { TOrdersSnapshotSortOrder } from './ModuleFetchOrdersSnapshot.ts';

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
