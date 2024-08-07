import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TTransferBlockingRuleCreate,
    TTransferBlockingRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { ModuleSetTransferRule } from './ModuleSetTransferRule';

type TSetTransferBlockingRuleDescriptor = TValueDescriptor2<true>;

export const ModuleSetTransferBlockingRuleOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const setTransferRule = ModuleSetTransferRule(ctx);

        return (
            props: TTransferBlockingRuleCreate | TTransferBlockingRuleUpdate,
            options,
        ): Observable<TSetTransferBlockingRuleDescriptor> => {
            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    setTransferRule(
                        { ...props, target },
                        { ...options, skipAuthentication: false },
                    ).pipe(
                        mapValueDescriptor((): TSetTransferBlockingRuleDescriptor => {
                            return createSyncedValueDescriptor(true as const);
                        }),
                    ),
                ),
            );
        };
    },
);
