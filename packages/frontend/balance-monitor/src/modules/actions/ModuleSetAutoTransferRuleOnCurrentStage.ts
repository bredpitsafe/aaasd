import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TAutoTransferRuleCreate,
    TAutoTransferRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { ModuleSetAutoTransferRule } from './ModuleSetAutoTransferRule';

type TSetAutoTransferRuleDescriptor = TValueDescriptor2<true>;

export const ModuleSetAutoTransferRuleOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const setTransferRule = ModuleSetAutoTransferRule(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (
            props: TAutoTransferRuleCreate | TAutoTransferRuleUpdate,
            options,
        ): Observable<TSetAutoTransferRuleDescriptor> => {
            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    setTransferRule(
                        { ...props, target },
                        { ...options, skipAuthentication: false },
                    ).pipe(
                        mapValueDescriptor((): TSetAutoTransferRuleDescriptor => {
                            return createSyncedValueDescriptor(true as const);
                        }),
                    ),
                ),
            );
        };
    },
);
