import type { user_settings } from '@prisma/client';
import { head, isNil } from 'lodash-es';

export const extractAppNameFrom = (tags: user_settings['tags']) => {
    const appName = head(tags);

    if (isNil(appName)) {
        throw new Error(`Data corruption error. Tags must have at least one item for appName`);
    }

    return appName;
};
