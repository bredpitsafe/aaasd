import { faker } from '@faker-js/faker';
import type { TPolicy } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

let prevId = 0;
export const randomPolicy = (): TPolicy => {
    return {
        id: prevId++,
        description: faker.lorem.sentence({ min: 1, max: 30 }),
        arguments: [],
        templateName: faker.lorem.words(3),
    };
};
