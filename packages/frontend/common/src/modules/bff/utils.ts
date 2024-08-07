import type { TModuleConstructor } from '@frontend/common/src/di';
import { ModuleBFF } from '@frontend/common/src/modules/bff';
import type { TWithSocketTarget } from '@frontend/common/src/types/domain/sockets.ts';
import type {
    TObservableProcedure,
    TObservableProcedureOptions,
    TObservableProcedureSettings,
} from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { switchMap } from 'rxjs';

export function createModuleSubscriptionWithCurrentBFFStage<P extends TWithSocketTarget, R>(
    SubscribeFactory: TModuleConstructor<TObservableProcedure<P, R>>,
    settings?: TObservableProcedureSettings<Omit<P, 'target'>>,
) {
    return createObservableProcedure((ctx) => {
        const { getCurrentBFFSocket$ } = ModuleBFF(ctx);
        const subscribe = SubscribeFactory(ctx);

        return (params: Omit<P, 'target'>, options: TObservableProcedureOptions) => {
            return getCurrentBFFSocket$().pipe(
                switchMap((target) => {
                    return subscribe({ ...params, target } as P, options);
                }),
            );
        };
    }, settings);
}
