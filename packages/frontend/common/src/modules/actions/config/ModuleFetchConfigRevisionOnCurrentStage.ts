import { first, switchMap } from 'rxjs/operators';

import type { TComponentId } from '../../../types/domain/component';
import type { TSocketURL } from '../../../types/domain/sockets';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleFetchConfigRevision } from './ModuleFetchConfigRevision.ts';

export const ModuleFetchConfigRevisionOnCurrentStage = createObservableProcedure((ctx) => {
    const fetch = ModuleFetchConfigRevision(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (
        params: {
            id: TComponentId;
            digest: string;
        },
        options,
    ) => {
        return currentSocketUrl$.pipe(
            first((target): target is TSocketURL => target !== undefined),
            switchMap((target) => fetch({ target, ...params }, options)),
            mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.at(0))),
        );
    };
});
