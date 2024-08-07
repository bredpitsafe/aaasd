import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TRuleId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

import { ModuleDeleteTransferRule } from './ModuleDeleteTransferRule';

type TDeleteTransferBlockingRuleDescriptor = TValueDescriptor2<true>;

export const ModuleDeleteTransferBlockingRuleOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const deleteTransferRule = ModuleDeleteTransferRule(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (id: TRuleId, options): Observable<TDeleteTransferBlockingRuleDescriptor> => {
            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    deleteTransferRule(
                        { target, id },
                        { ...options, skipAuthentication: false },
                    ).pipe(
                        map((): TDeleteTransferBlockingRuleDescriptor => {
                            return createSyncedValueDescriptor(true);
                        }),
                    ),
                ),
            );
        };
    },
);
