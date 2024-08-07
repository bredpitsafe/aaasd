import { isNil } from 'lodash-es';
import { first } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { ModuleSocketPage } from '../../socketPage';
import type { TUpdatableVirtualAccount } from './ModuleUpdateVirtualAccounts.ts';
import { ModuleUpdateVirtualAccounts } from './ModuleUpdateVirtualAccounts.ts';

export const ModuleUpdateVirtualAccountsOnCurrentStage = createObservableProcedure((ctx) => {
    const update = ModuleUpdateVirtualAccounts(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (virtualAccounts: TUpdatableVirtualAccount[], options) => {
        return currentSocketUrl$.pipe(
            first((target): target is TSocketURL => !isNil(target)),
            switchMap((target) => update({ target, virtualAccounts }, options)),
        );
    };
});
