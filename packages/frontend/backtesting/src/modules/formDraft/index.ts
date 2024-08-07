import { ModuleFactory } from '@frontend/common/src/di';

import { formDraftsCounter$, getFormDraftsCount, setFormDraftsCount } from './data';

export const ModuleFormDraft = ModuleFactory(() => ({
    formDraftsCounter$,
    setFormDraftsCount,
    getFormDraftsCount,
}));
