import { first, switchMap } from 'rxjs';

import type { TComponentId } from '../../../types/domain/component.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleCreateComponentStateRevision } from './ModuleCreateComponentStateRevision.ts';

export const ModuleCreateCurrentComponentStateRevision = createObservableProcedure((ctx) => {
    const handler = ModuleCreateComponentStateRevision(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (
        params: {
            componentId: TComponentId;
            newStateRaw: string;
            currentDigest?: string;
        },
        options,
    ) => {
        return currentSocketUrl$.pipe(
            first((url): url is TSocketURL => url !== undefined),
            switchMap((url) => handler({ target: url, ...params }, options)),
        );
    };
});
