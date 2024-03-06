import { ModuleFactory } from '@frontend/common/src/di';

import { getRevision$ } from './getRevision$';

export const ModuleTradingServersManager = ModuleFactory((ctx) => {
    return {
        getRevision$: getRevision$.bind(null, ctx),
    };
});
