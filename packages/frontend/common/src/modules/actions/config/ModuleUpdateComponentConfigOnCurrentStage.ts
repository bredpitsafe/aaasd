import { first } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import type { TComponent } from '../../../types/domain/component.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleUpdateConfig } from './ModuleUpdateConfig.ts';

export const ModuleUpdateComponentConfigOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const update = ModuleUpdateConfig(ctx);

        return (
            params: {
                id: TComponent['id'];
                newConfigRaw: string;
                currentDigest?: string;
            },
            options,
        ) => {
            return currentSocketUrl$.pipe(
                first((target): target is TSocketURL => target !== undefined),
                switchMap((target) => update({ ...params, target }, options)),
            );
        };
    },
);
