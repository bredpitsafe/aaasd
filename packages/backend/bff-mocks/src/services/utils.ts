import { assertNever } from '@common/utils';
import type { TSortOrder } from '@grpc-schemas/instruments-api-sdk/types/v1/snapshot_pagination';

export function getClientSortOrder(
    sortOrder: Exclude<TSortOrder, 'SORT_ORDER_DIRECTION_UNSPECIFIED'>,
): 'asc' | 'desc' {
    switch (sortOrder) {
        case 'SORT_ORDER_ASC':
            return 'asc';
        case 'SORT_ORDER_DESC':
            return 'desc';
        default:
            assertNever(sortOrder);
    }
}
