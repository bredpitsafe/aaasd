import { isNil } from 'lodash-es';
import { first } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { ModuleSocketPage } from '../../socketPage';
import type { TUpdatableRealAccount } from './def.ts';
import { ModuleUpdateRealAccounts } from './ModuleUpdateRealAccounts.ts';

export const ModuleUpdateRealAccountsOnCurrentStage = createObservableProcedure((ctx) => {
    const update = ModuleUpdateRealAccounts(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (accounts: TUpdatableRealAccount[], options) => {
        return currentSocketUrl$.pipe(
            first((target): target is TSocketURL => !isNil(target)),
            switchMap((target) => update({ target, accounts }, options)),
        );
    };
});
