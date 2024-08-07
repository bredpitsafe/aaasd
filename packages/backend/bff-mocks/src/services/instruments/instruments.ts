import type { Nil } from '@common/types';
import { assertNever } from '@common/utils';
import { faker } from '@faker-js/faker';
import type {
    TInstrument,
    TInstrumentDynamicData,
    TInstrumentDynamicDataSortOrderField,
    TInstrumentSortOrderField,
} from '@grpc-schemas/instruments-api-sdk/index.services.instruments.v1.js';
import type { InstrumentServiceServer } from '@grpc-schemas/instruments-api-sdk/index.services.instruments.v1.js';
import { isEmpty, isNil, isUndefined, orderBy, unzip } from 'lodash-es';

import { EActorName } from '../../def/actor.ts';
import { wrapUnaryCall } from '../../utils/wrapUnaryCall.ts';
import { wrapWritableStream } from '../../utils/wrapWritableStream.ts';
import { getClientSortOrder } from '../utils.ts';
import { randomDynamicInstrumentFactory } from './generators/randomDynamicInstrumentFactory.ts';
import { randomInstrumentFactory } from './generators/randomInstrumentFactory.ts';
import { randomInstrumentRevisionFactory } from './generators/randomInstrumentRevisionFactory.ts';

export { InstrumentServiceService } from '@grpc-schemas/instruments-api-sdk/index.services.instruments.v1.js';

const SNAPSHOT_ITEMS = 300;
const TOTAL_ITEMS = 5078;

const INSTRUMENTS = faker.helpers
    .multiple(randomInstrumentFactory(), { count: TOTAL_ITEMS })
    .sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

const INSTRUMENTS_DYNAMIC = faker.helpers
    .multiple(randomDynamicInstrumentFactory(), { count: TOTAL_ITEMS })
    .sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

const INSTRUMENT_REVISIONS = faker.helpers.multiple(randomInstrumentRevisionFactory(5), {
    count: TOTAL_ITEMS,
});

const INSTRUMENT_REVISIONS_SUBSCRIPTION = faker.helpers.multiple(
    randomInstrumentRevisionFactory(1),
    {
        count: TOTAL_ITEMS,
    },
);

export const instrumentsService: InstrumentServiceServer = {
    subscribeToInstruments: (stream) => {
        const call = wrapWritableStream(
            EActorName.InstrumentsService,
            instrumentsService.subscribeToInstruments.name,
            stream,
        );

        call.write({
            response: { type: 'ok', ok: { platformTime: undefined } },
        });

        const offset = call.request.snapshot?.pagination?.offset ?? 0;
        const limit = call.request.snapshot?.pagination?.limit ?? SNAPSHOT_ITEMS;
        const includeProviders = call.request.params?.includeProviders ?? false;
        const filter = call.request.filters.include;
        const sort = call.request.snapshot?.sort;

        let items = INSTRUMENTS;

        if (!isNil(sort) && !isEmpty(sort.fields)) {
            const sorting = unzip(
                sort.fields
                    .map(getInstrumentSort)
                    .filter(
                        (
                            sortField,
                        ): sortField is Exclude<ReturnType<typeof getInstrumentSort>, Nil> =>
                            !isNil(sortField),
                    ),
            ) as [
                Exclude<ReturnType<typeof getInstrumentSort>, Nil>[0][],
                Exclude<ReturnType<typeof getInstrumentSort>, Nil>[1][],
            ];

            items = isEmpty(sorting) ? items : orderBy(items, sorting[0], sorting[1]);
        }

        if (!isNil(filter)) {
            const { instrumentIds, names, nameRegex, approvalStatuses, exchangeRegex } = filter;

            if (!isEmpty(instrumentIds)) {
                items = items.filter((item) => instrumentIds.includes(item.id));
            }
            if (!isEmpty(names)) {
                items = items.filter((item) => names.includes(item.name));
            }
            if (!isNil(nameRegex)) {
                items = items.filter((item) => item.name.match(new RegExp(nameRegex)));
            }
            if (!isEmpty(approvalStatuses)) {
                items = items.filter((item) => approvalStatuses.includes(item.approvalStatus));
            }
            if (!isNil(exchangeRegex)) {
                items = items.filter((item) => item.exchange.match(new RegExp(exchangeRegex)));
            }
        }

        if (!includeProviders) {
            items = items.map((item) => {
                return includeProviders ? item : { ...item, providerInstruments: [] };
            });
        }

        call.write({
            response: {
                type: 'snapshot',
                snapshot: {
                    platformTime: new Date().toISOString(),
                    entities: items.slice(offset, limit + offset),
                    total: items.length,
                },
            },
        });
    },
    subscribeToInstrumentsDynamicData: (stream): void => {
        const call = wrapWritableStream(
            EActorName.InstrumentsService,
            instrumentsService.subscribeToInstrumentsDynamicData.name,
            stream,
        );

        call.write({
            response: { type: 'ok', ok: { platformTime: undefined } },
        });

        const offset = call.request.snapshot?.pagination?.offset ?? 0;
        const limit = call.request.snapshot?.pagination?.limit ?? SNAPSHOT_ITEMS;
        const filter = call.request.filters.include;
        const sort = call.request.snapshot?.sort;

        let items = INSTRUMENTS_DYNAMIC;

        if (!isNil(sort) && !isEmpty(sort.fields)) {
            const sorting = unzip(
                sort.fields
                    .map(getInstrumentDynamicDataSort)
                    .filter(
                        (
                            sortField,
                        ): sortField is Exclude<
                            ReturnType<typeof getInstrumentDynamicDataSort>,
                            Nil
                        > => !isNil(sortField),
                    ),
            ) as [
                Exclude<ReturnType<typeof getInstrumentDynamicDataSort>, Nil>[0][],
                Exclude<ReturnType<typeof getInstrumentDynamicDataSort>, Nil>[1][],
            ];

            items = isEmpty(sorting) ? items : orderBy(items, sorting[0], sorting[1]);
        }

        if (!isNil(filter)) {
            const { instrumentIds, names, nameRegex } = filter;

            if (!isEmpty(instrumentIds)) {
                items = items.filter((item) => instrumentIds.includes(item.id));
            }
            if (!isEmpty(names)) {
                items = items.filter((item) => names.includes(item.name));
            }
            if (!isNil(nameRegex)) {
                items = items.filter((item) => item.name.match(new RegExp(nameRegex)));
            }
        }

        call.write({
            response: {
                type: 'snapshot',
                snapshot: {
                    platformTime: new Date().toISOString(),
                    entities: items.slice(offset, limit + offset),
                    total: TOTAL_ITEMS,
                },
            },
        });
    },
    subscribeToInstrumentRevisions: (call): void => {
        call.write({
            response: { type: 'ok', ok: { platformTime: faker.date.recent().toISOString() } },
        });

        const filter = call.request.filters?.include;

        let items = INSTRUMENT_REVISIONS_SUBSCRIPTION;

        if (!isNil(filter)) {
            const { instrumentIds, approvalStatuses } = filter;

            if (!isEmpty(instrumentIds)) {
                items = items.filter((item) => instrumentIds.includes(item.instrumentId));
            }

            if (!isEmpty(approvalStatuses)) {
                items = items.filter((item) => approvalStatuses.includes(item.status));
            }
        }

        call.write({
            response: {
                type: 'updates',
                updates: { upserted: items },
            },
        });
    },
    fetchInstrumentsSnapshot: (call, cb): void => {
        const callback = wrapUnaryCall(
            EActorName.InstrumentsService,
            instrumentsService.fetchInstrumentsSnapshot.name,
            call,
            cb,
        );

        const filter = call.request.filters.include;
        const sort = call.request.snapshot.sort;

        let items = INSTRUMENTS;

        if (!isNil(sort) && !isEmpty(sort.fields)) {
            const sorting = unzip(
                sort.fields
                    .map(getInstrumentSort)
                    .filter(
                        (
                            sortField,
                        ): sortField is Exclude<ReturnType<typeof getInstrumentSort>, Nil> =>
                            !isNil(sortField),
                    ),
            ) as [
                Exclude<ReturnType<typeof getInstrumentSort>, Nil>[0][],
                Exclude<ReturnType<typeof getInstrumentSort>, Nil>[1][],
            ];

            items = isEmpty(sorting) ? items : orderBy(items, sorting[0], sorting[1]);
        }

        if (!isNil(filter)) {
            const { instrumentIds, names, nameRegex, approvalStatuses } = filter;

            if (!isEmpty(instrumentIds)) {
                items = items.filter((item) => instrumentIds.includes(item.id));
            }
            if (!isEmpty(names)) {
                items = items.filter((item) => names.includes(item.name));
            }
            if (!isNil(nameRegex)) {
                items = items.filter((item) => item.name.match(new RegExp(nameRegex)));
            }
            if (!isEmpty(approvalStatuses)) {
                items = items.filter((item) => approvalStatuses.includes(item.approvalStatus));
            }
        } else {
            items = INSTRUMENTS.slice(0, SNAPSHOT_ITEMS);
        }

        const platformTime = call.request.platformTime;

        if (!isNil(platformTime)) {
            items = items.map((item) => ({ ...item, platformTime }));
        }

        callback(null, { entities: items, total: items.length });
    },
    fetchInstrumentRevisionsLog: (call, cb): void => {
        const callback = wrapUnaryCall(
            EActorName.InstrumentsService,
            instrumentsService.fetchInstrumentRevisionsLog.name,
            call,
            cb,
        );

        const filter = call.request.filters.include;

        let items = INSTRUMENT_REVISIONS;

        if (!isNil(filter)) {
            const { instrumentId } = filter;

            if (!isNil(instrumentId)) {
                items = items.filter((item) => item.instrumentId === instrumentId);
            }
        }

        callback(null, {
            entities: items,
        });
    },
    approveInstrument: (call, cb): void => {
        const callback = wrapUnaryCall(
            EActorName.InstrumentsService,
            instrumentsService.approveInstrument.name,
            call,
            cb,
        );

        const ids = call.request.targets
            .map((item) => item.id?.instrumentId)
            .filter((item): item is number => !isUndefined(item));

        const items = INSTRUMENTS.filter(
            (item) =>
                ids.includes(item.id) &&
                item.approvalStatus === 'INSTRUMENT_APPROVAL_STATUS_UNAPPROVED',
        );

        if (isEmpty(items)) {
            callback(new Error('failed to approve instruments'));
            return;
        }

        callback(null, {});
    },
    updateProviderInstrumentsOverride: (call, cb): void => {
        const callback = wrapUnaryCall(
            EActorName.InstrumentsService,
            instrumentsService.updateProviderInstrumentsOverride.name,
            call,
            cb,
        );
        callback(null, {});
    },
};

function getInstrumentSort({
    field,
    sortOrder,
}: TInstrumentSortOrderField): [keyof TInstrument, 'asc' | 'desc'] | undefined {
    if (
        field === 'INSTRUMENT_SORT_FIELD_UNSPECIFIED' ||
        sortOrder === 'SORT_ORDER_DIRECTION_UNSPECIFIED'
    ) {
        return undefined;
    }

    switch (field) {
        case 'INSTRUMENT_SORT_FIELD_ID':
            return ['id', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_SORT_FIELD_KIND':
            return ['kind', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_SORT_FIELD_EXCHANGE':
            return ['exchange', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_SORT_FIELD_NAME':
            return ['name', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_SORT_FIELD_PLATFORM_TIME':
            return ['platformTime', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_SORT_FIELD_APPROVAL_STATUS':
            return ['approvalStatus', getClientSortOrder(sortOrder)];
        default:
            assertNever(field);
    }
}

function getInstrumentDynamicDataSort({
    field,
    sortOrder,
}: TInstrumentDynamicDataSortOrderField):
    | [keyof TInstrumentDynamicData, 'asc' | 'desc']
    | undefined {
    if (
        field === 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_UNSPECIFIED' ||
        sortOrder === 'SORT_ORDER_DIRECTION_UNSPECIFIED'
    ) {
        return undefined;
    }

    switch (field) {
        case 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_NAME':
            return ['name', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_PLATFORM_TIME':
            return ['platformTime', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_STATUS':
            return ['status', getClientSortOrder(sortOrder)];
        default:
            assertNever(field);
    }
}
