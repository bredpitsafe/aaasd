import { faker } from '@faker-js/faker';
import type {
    TPermission,
    TStringList,
} from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

export const randomPermission = (): TPermission => {
    return {
        name: faker.lorem.slug({ min: 1, max: 4 }),
        params: new Map<string, string>(),
        attrs: new Map<string, TStringList>(
            faker.helpers.multiple(randomPermissionAttr, { count: { min: 0, max: 10 } }),
        ),
    };
};

const randomPermissionAttr = (): [string, TStringList] => {
    return [
        faker.lorem.slug({ min: 1, max: 3 }),
        {
            values: faker.helpers.multiple(() => faker.string.alphanumeric(10), {
                count: { min: 1, max: 10 },
            }),
        },
    ];
};
