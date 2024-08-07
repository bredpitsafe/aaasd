import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TRuleId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { ModuleDeleteLimitingTransferRule } from './ModuleDeleteLimitingTransferRule.ts';

type TDeleteAmountLimitsRuleDescriptor = TValueDescriptor2<true>;

export const ModuleDeleteLimitingTransferRuleOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const deleteAmountLimitsRule = ModuleDeleteLimitingTransferRule(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (id: TRuleId, options): Observable<TDeleteAmountLimitsRuleDescriptor> => {
            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    deleteAmountLimitsRule(
                        { target, id },
                        { ...options, skipAuthentication: false },
                    ).pipe(
                        mapValueDescriptor((): TDeleteAmountLimitsRuleDescriptor => {
                            return createSyncedValueDescriptor(true);
                        }),
                    ),
                ),
            );
        };
    },
);
