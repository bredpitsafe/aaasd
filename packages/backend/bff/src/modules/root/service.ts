import { once } from 'lodash-es';

import { TStages } from '../../def/stages.ts';
import { appConfig } from '../../utils/appConfig.ts';
import { typedObjectEntries } from '../../utils/types.ts';

export const getStages = once((): TStages => {
    return typedObjectEntries(appConfig.stages).reduce((acc, [name, { category, env }]) => {
        acc[category] = acc[category] ?? {};
        acc[category][env] = acc[category][env] ?? [];
        acc[category][env].push(name);
        return acc;
    }, {} as TStages);
});
