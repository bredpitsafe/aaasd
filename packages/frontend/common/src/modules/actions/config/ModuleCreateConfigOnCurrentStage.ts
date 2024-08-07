import { first } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type { EComponentConfigType } from '../../../types/domain/component';
import type { TServerId } from '../../../types/domain/servers';
import type { TSocketURL } from '../../../types/domain/sockets';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleCreateConfig } from './ModuleCreateConfig.ts';

export const ModuleCreateConfigOnCurrentStage = createObservableProcedure((ctx) => {
    const create = ModuleCreateConfig(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (
        params: {
            nodeId: TServerId;
            configType: EComponentConfigType;
            config: string;
            name?: string;
            kind?: string;
        },
        options,
    ) => {
        return currentSocketUrl$.pipe(
            first((target): target is TSocketURL => target !== undefined),
            switchMap((target) => create({ target, ...params }, options)),
        );
    };
});
