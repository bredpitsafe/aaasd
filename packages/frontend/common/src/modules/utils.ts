import type { TLogPaginationTimeDirection, TSortOrder } from '@backend/bff/src/modules/defs.ts';
import { assertNever } from '@common/utils/src/assert.ts';
import { sortBy } from 'lodash-es';

import { EDirection, ESortOrder } from '../types/domain/pagination.ts';

export function sortByName<T extends { name: string }>(arr: T[]): T[] {
    return sortBy(arr, (item) => item.name.toLowerCase());
}

export function getClientSortOrder(
    sortOrder: Exclude<TSortOrder, 'SORT_ORDER_DIRECTION_UNSPECIFIED'>,
): ESortOrder {
    switch (sortOrder) {
        case 'SORT_ORDER_ASC':
            return ESortOrder.Ascending;
        case 'SORT_ORDER_DESC':
            return ESortOrder.Descending;
        default:
            assertNever(sortOrder);
    }
}

export function getServerSortOrder(
    sortOrder: ESortOrder,
): Exclude<TSortOrder, 'SORT_ORDER_DIRECTION_UNSPECIFIED'> {
    switch (sortOrder) {
        case ESortOrder.Ascending:
            return 'SORT_ORDER_ASC';
        case ESortOrder.Descending:
            return 'SORT_ORDER_DESC';
        default:
            assertNever(sortOrder);
    }
}

export function getClientDirection(
    direction: Exclude<TLogPaginationTimeDirection, 'TIME_DIRECTION_UNSPECIFIED'>,
): EDirection {
    switch (direction) {
        case 'TIME_DIRECTION_FORWARD':
            return EDirection.Forward;
        case 'TIME_DIRECTION_BACKWARD':
            return EDirection.Backward;
        default:
            assertNever(direction);
    }
}

export function getServerDirection(
    direction: EDirection,
): Exclude<TLogPaginationTimeDirection, 'TIME_DIRECTION_UNSPECIFIED'> {
    switch (direction) {
        case EDirection.Forward:
            return 'TIME_DIRECTION_FORWARD';
        case EDirection.Backward:
            return 'TIME_DIRECTION_BACKWARD';
        default:
            assertNever(direction);
    }
}
