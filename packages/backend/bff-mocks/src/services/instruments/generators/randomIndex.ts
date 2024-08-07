import { faker } from '@faker-js/faker';
import type {
    TIndex,
    TProviderIndex,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/index_api.js';

let prevId = 0;
export const randomIndex = (): TIndex => {
    return {
        id: prevId++,
        name: faker.finance.currencyCode(),
        approvalStatus: faker.helpers.arrayElement([
            'INDEX_APPROVAL_STATUS_UNSPECIFIED',
            'INDEX_APPROVAL_STATUS_UNAPPROVED',
            'INDEX_APPROVAL_STATUS_APPROVED',
        ]),
        platformTime: faker.date.recent().toISOString(),
        providerIndexes: faker.helpers.multiple(randomProviderIndex, {
            count: {
                min: 1,
                max: 20,
            },
        }),
    };
};

const randomProviderIndex = (): TProviderIndex => {
    return {
        name: faker.finance.currencyCode(),
        provider: faker.company.name(),
        platformTime: faker.date.recent().toISOString(),
    };
};
