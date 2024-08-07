import { faker } from '@faker-js/faker';
import type { TInstrumentRevision } from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

export function randomInstrumentRevisionFactory(pastOffsetInDays?: number) {
    let prevId = 0;

    return (): TInstrumentRevision => {
        return {
            instrumentId: prevId++,
            platformTime: faker.date.recent({ days: pastOffsetInDays }).toISOString(),
            user: faker.internet.userName(),
            status: faker.helpers.arrayElement([
                'INSTRUMENT_APPROVAL_STATUS_UNSPECIFIED',
                'INSTRUMENT_APPROVAL_STATUS_UNREDUCED',
                'INSTRUMENT_APPROVAL_STATUS_UNAPPROVED',
                'INSTRUMENT_APPROVAL_STATUS_APPROVED',
                'INSTRUMENT_APPROVAL_STATUS_BLOCKED',
                'INSTRUMENT_APPROVAL_STATUS_UNREDUCED_AFTER_APPROVAL',
            ]),
        };
    };
}
