import { createObservableBox } from '@frontend/common/src/utils/rx';

export const {
    get: getFormDraftsCount,
    set: setFormDraftsCount,
    obs: formDraftsCounter$,
} = createObservableBox<number>(0);
