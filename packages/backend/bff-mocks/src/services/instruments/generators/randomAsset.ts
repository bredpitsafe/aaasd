import { faker } from '@faker-js/faker';
import type {
    TAsset,
    TProviderAsset,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/asset_api.js';

let prevId = 0;
export const randomAsset = (): TAsset => {
    return {
        id: prevId++,
        name: faker.finance.currencyCode(),
        approvalStatus: faker.helpers.arrayElement([
            'ASSET_APPROVAL_STATUS_UNSPECIFIED',
            'ASSET_APPROVAL_STATUS_UNAPPROVED',
            'ASSET_APPROVAL_STATUS_APPROVED',
        ]),
        platformTime: faker.date.recent().toISOString(),
        providerAssets: faker.helpers.multiple(randomProviderAsset, {
            count: {
                min: 1,
                max: 20,
            },
        }),
    };
};

const randomProviderAsset = (): TProviderAsset => {
    return {
        name: faker.finance.currencyCode(),
        provider: faker.company.name(),
        platformTime: faker.date.recent().toISOString(),
    };
};
