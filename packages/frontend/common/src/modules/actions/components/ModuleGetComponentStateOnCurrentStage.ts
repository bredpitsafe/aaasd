import { isNil } from 'lodash-es';
import { first, switchMap } from 'rxjs/operators';

import type { TComponentId } from '../../../types/domain/component.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { ModuleSocketPage } from '../../socketPage';
import type { TComponentStateDescriptor } from './ModuleGetComponentState.ts';
import { ModuleGetComponentState } from './ModuleGetComponentState.ts';

export type { TComponentStateDescriptor };

type TParams = {
    componentId: TComponentId;
    digest: string;
};

export const ModuleGetComponentStateOnCurrentStage = createObservableProcedure((ctx) => {
    const getComponentState = ModuleGetComponentState(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (params: TParams, options) => {
        return currentSocketUrl$.pipe(
            first((url): url is TSocketURL => !isNil(url)),
            switchMap((target) => getComponentState({ target, ...params }, options)),
        );
    };
});
