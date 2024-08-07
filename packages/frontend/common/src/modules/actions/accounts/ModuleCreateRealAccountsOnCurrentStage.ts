import { isNil } from 'lodash-es';
import { first } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { ModuleSocketPage } from '../../socketPage';
import type { TUpdatableRealAccount } from './def.ts';
import { ModuleCreateRealAccounts } from './ModuleCreateRealAccounts.ts';

export const ModuleCreateRealAccountsOnCurrentStage = createObservableProcedure((ctx) => {
    const create = ModuleCreateRealAccounts(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (realAccounts: TUpdatableRealAccount[], options) => {
        return currentSocketUrl$.pipe(
            first((target): target is TSocketURL => !isNil(target)),
            switchMap((target) =>
                create(
                    {
                        target,
                        accounts: realAccounts,
                    },
                    options,
                ),
            ),
        );
    };
});
