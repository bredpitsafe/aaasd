import { faker } from '@faker-js/faker';
import type { TUser } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

import { randomGroupName } from './randomGroup.ts';

export const randomUser = (): TUser => {
    return {
        name: randomUserName(),
        description: faker.lorem.sentence({ min: 1, max: 30 }),
        displayName: faker.person.firstName() + ' ' + faker.person.lastName(),
        email: faker.internet.email(),
        groups: faker.helpers.multiple(randomGroupName, { count: { min: 0, max: 10 } }),
        policies: faker.helpers.multiple(faker.number.int, { count: { min: 0, max: 20 } }),
    };
};

export const randomUserName = (): TUser['name'] => {
    return faker.internet.userName();
};
