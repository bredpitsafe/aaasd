import { getNowNanoseconds } from '@common/utils';
import { first } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type { TComponentId } from '../../../types/domain/component';
import type { TSocketURL } from '../../../types/domain/sockets';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { ModuleSocketPage } from '../../socketPage';
import { EFetchHistoryDirection } from '../def.ts';
import { ModuleFetchConfigRevisions } from './ModuleFetchConfigRevisions.ts';

const CONFIG_REVISIONS_LIMIT = 500;

export const ModuleFetchConfigRevisionsOnCurrentStage = createObservableProcedure((ctx) => {
    const fetch = ModuleFetchConfigRevisions(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (props: { id: TComponentId }, options) => {
        return currentSocketUrl$.pipe(
            first((target): target is TSocketURL => target !== undefined),
            switchMap((target) =>
                fetch(
                    {
                        target,
                        params: {
                            direction: EFetchHistoryDirection.Backward,
                            platformTime: getNowNanoseconds(),
                            limit: CONFIG_REVISIONS_LIMIT,
                        },
                        ...props,
                    },
                    options,
                ),
            ),
        );
    };
});
