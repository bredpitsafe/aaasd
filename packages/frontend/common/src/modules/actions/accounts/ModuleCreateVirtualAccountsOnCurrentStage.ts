import { isNil } from 'lodash-es';
import { first } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type { TRealAccount, TVirtualAccount } from '../../../types/domain/account.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleCreateVirtualAccounts } from './ModuleCreateVirtualAccounts.ts';

export type TCreatableVirtualAccount = Pick<TVirtualAccount, 'name' | 'isInternal'> & {
    realAccountIds: TRealAccount['id'][];
};

export const ModuleCreateVirtualAccountsOnCurrentStage = createObservableProcedure((ctx) => {
    const create = ModuleCreateVirtualAccounts(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (virtualAccounts: TCreatableVirtualAccount[], options) => {
        return currentSocketUrl$.pipe(
            first((target): target is TSocketURL => !isNil(target)),
            switchMap((target) => create({ target, virtualAccounts }, options)),
        );
    };
});
