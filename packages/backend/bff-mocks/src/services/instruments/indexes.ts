import type { Nil } from '@common/types';
import { assertNever } from '@common/utils';
import { faker } from '@faker-js/faker';
import type {
    IndexServiceServer,
    TIndexSortOrderField,
} from '@grpc-schemas/instruments-api-sdk/index.services.instruments.v1.js';
import type { TIndex } from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/index_api.js';
import { isEmpty, isNil, orderBy, unzip } from 'lodash-es';

import { EActorName } from '../../def/actor.ts';
import { wrapUnaryCall } from '../../utils/wrapUnaryCall.ts';
import { wrapWritableStream } from '../../utils/wrapWritableStream.ts';
import { getClientSortOrder } from '../utils.ts';
import { randomIndex } from './generators/randomIndex.ts';

export { IndexServiceService } from '@grpc-schemas/instruments-api-sdk/index.services.instruments.v1.js';

const SNAPSHOT_ITEMS = 300;
const TOTAL_ITEMS = 5078;

const INDEXES = faker.helpers
    .multiple(randomIndex, {
        count: TOTAL_ITEMS,
    })
    .sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

export const indexesService: IndexServiceServer = {
    subscribeToIndexes: (stream) => {
        const call = wrapWritableStream(
            EActorName.InstrumentsService,
            indexesService.subscribeToIndexes.name,
            stream,
        );
        call.write({
            response: { type: 'ok', ok: { platformTime: undefined } },
        });

        const offset = call.request.snapshot?.pagination?.offset ?? 0;
        const limit = call.request.snapshot?.pagination?.limit ?? SNAPSHOT_ITEMS;

        const sort = call.request.snapshot?.sort;

        let items = INDEXES;

        if (!isNil(sort) && !isEmpty(sort.fields)) {
            const sorting = unzip(
                sort.fields
                    .map(getIndexSort)
                    .filter(
                        (sortField): sortField is Exclude<ReturnType<typeof getIndexSort>, Nil> =>
                            !isNil(sortField),
                    ),
            ) as [
                Exclude<ReturnType<typeof getIndexSort>, Nil>[0][],
                Exclude<ReturnType<typeof getIndexSort>, Nil>[1][],
            ];

            items = isEmpty(sorting) ? items : orderBy(items, sorting[0], sorting[1]);
        }

        call.write({
            response: {
                type: 'snapshot',
                snapshot: {
                    entities: items.slice(offset, limit + offset),
                    total: items.length,
                    platformTime: undefined,
                },
            },
        });
    },
    approveIndex: (call, cb): void => {
        const callback = wrapUnaryCall(
            EActorName.InstrumentsService,
            indexesService.approveIndex.name,
            call,
            cb,
        );
        callback(null, {});
    },
};

function getIndexSort({
    field,
    sortOrder,
}: TIndexSortOrderField): [keyof TIndex, 'asc' | 'desc'] | undefined {
    if (
        field === 'INDEX_SORT_FIELD_UNSPECIFIED' ||
        sortOrder === 'SORT_ORDER_DIRECTION_UNSPECIFIED'
    ) {
        return undefined;
    }

    switch (field) {
        case 'INDEX_SORT_FIELD_NAME':
            return ['name', getClientSortOrder(sortOrder)];
        case 'INDEX_SORT_FIELD_PLATFORM_TIME':
            return ['platformTime', getClientSortOrder(sortOrder)];
        case 'INDEX_SORT_FIELD_APPROVAL_STATUS':
            return ['approvalStatus', getClientSortOrder(sortOrder)];
        default:
            assertNever(field);
    }
}
