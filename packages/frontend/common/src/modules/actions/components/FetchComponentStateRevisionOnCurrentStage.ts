import type { ISO } from '@common/types';
import { isNil } from 'lodash-es';
import { filter, switchMap } from 'rxjs/operators';

import type { TComponentId } from '../../../types/domain/component.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleFetchComponentStateRevision } from './FetchComponentStateRevision.ts';

export const ModuleFetchComponentStateRevisionOnCurrentStage = createObservableProcedure((ctx) => {
    const fetch = ModuleFetchComponentStateRevision(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (
        params: {
            componentId: TComponentId;
            platformTime: ISO;
        },
        options,
    ) => {
        return currentSocketUrl$.pipe(
            filter((target): target is TSocketURL => !isNil(target)),
            switchMap((target) => {
                return fetch(
                    {
                        target,
                        componentId: params.componentId,
                        platformTime: params.platformTime,
                    },
                    options,
                );
            }),
        );
    };
});
