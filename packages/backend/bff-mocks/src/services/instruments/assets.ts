import type { Nil } from '@common/types';
import { assertNever } from '@common/utils';
import { faker } from '@faker-js/faker';
import type {
    AssetServiceServer,
    TAssetSortOrderField,
} from '@grpc-schemas/instruments-api-sdk/index.services.instruments.v1.js';
import type { TAsset } from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/asset_api.js';
import { isEmpty, isNil, orderBy, unzip } from 'lodash-es';

import { EActorName } from '../../def/actor.ts';
import { wrapUnaryCall } from '../../utils/wrapUnaryCall.ts';
import { wrapWritableStream } from '../../utils/wrapWritableStream.ts';
import { getClientSortOrder } from '../utils.ts';
import { randomAsset } from './generators/randomAsset.ts';

export { AssetServiceService } from '@grpc-schemas/instruments-api-sdk/index.services.instruments.v1.js';

const SNAPSHOT_ITEMS = 300;
const TOTAL_ITEMS = 5078;

const ASSETS = faker.helpers
    .multiple(randomAsset, {
        count: TOTAL_ITEMS,
    })
    .sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

export const assetsService: AssetServiceServer = {
    subscribeToAssets: (stream) => {
        const call = wrapWritableStream(
            EActorName.InstrumentsService,
            assetsService.subscribeToAssets.name,
            stream,
        );

        call.write({
            response: { type: 'ok', ok: { platformTime: faker.date.recent().toISOString() } },
        });

        const offset = call.request.snapshot?.pagination?.offset ?? 0;
        const limit = call.request.snapshot?.pagination?.limit ?? SNAPSHOT_ITEMS;

        const sort = call.request.snapshot?.sort;

        let items = ASSETS;

        if (!isNil(sort) && !isEmpty(sort.fields)) {
            const sorting = unzip(
                sort.fields
                    .map(getAssetSort)
                    .filter(
                        (sortField): sortField is Exclude<ReturnType<typeof getAssetSort>, Nil> =>
                            !isNil(sortField),
                    ),
            ) as [
                Exclude<ReturnType<typeof getAssetSort>, Nil>[0][],
                Exclude<ReturnType<typeof getAssetSort>, Nil>[1][],
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
    approveAsset: (call, cb): void => {
        const callback = wrapUnaryCall(
            EActorName.InstrumentsService,
            assetsService.approveAsset.name,
            call,
            cb,
        );
        callback(null, {});
    },
};

function getAssetSort({
    field,
    sortOrder,
}: TAssetSortOrderField): [keyof TAsset, 'asc' | 'desc'] | undefined {
    if (
        field === 'ASSET_SORT_FIELD_UNSPECIFIED' ||
        sortOrder === 'SORT_ORDER_DIRECTION_UNSPECIFIED'
    ) {
        return undefined;
    }

    switch (field) {
        case 'ASSET_SORT_FIELD_NAME':
            return ['name', getClientSortOrder(sortOrder)];
        case 'ASSET_SORT_FIELD_PLATFORM_TIME':
            return ['platformTime', getClientSortOrder(sortOrder)];
        case 'ASSET_SORT_FIELD_APPROVAL_STATUS':
            return ['approvalStatus', getClientSortOrder(sortOrder)];
        default:
            assertNever(field);
    }
}
