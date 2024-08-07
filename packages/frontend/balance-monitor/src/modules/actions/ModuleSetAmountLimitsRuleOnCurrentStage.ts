import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TAmountLimitsRuleCreate,
    TAmountLimitsRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { ModuleSetLimitingTransferRule } from './ModuleSetLimitingTransferRule';

type TSetAmountLimitsRuleDescriptor = TValueDescriptor2<true>;

export const ModuleSetAmountLimitsRuleOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const setLimitingTransferRule = ModuleSetLimitingTransferRule(ctx);

        return (
            props: TAmountLimitsRuleCreate | TAmountLimitsRuleUpdate,
            options,
        ): Observable<TSetAmountLimitsRuleDescriptor> => {
            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    setLimitingTransferRule({ ...props, target }, { ...options }).pipe(
                        mapValueDescriptor((): TSetAmountLimitsRuleDescriptor => {
                            return createSyncedValueDescriptor(true as const);
                        }),
                    ),
                ),
            );
        };
    },
);
