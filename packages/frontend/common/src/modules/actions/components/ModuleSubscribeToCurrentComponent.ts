import type { Observable } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type {
    TComponentTypeToType,
    TComponentTypeToTypeId,
} from '../../../types/domain/component.ts';
import { EComponentType } from '../../../types/domain/component.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import type { TWithTraceId } from '../def.ts';
import { ModuleSubscribeToCurrentComponentsSnapshot } from './ModuleSubscribeToCurrentComponentsSnapshot.ts';

export const ModuleSubscribeToCurrentComponent = createObservableProcedure(
    (ctx) => {
        const subscribeToComponents = ModuleSubscribeToCurrentComponentsSnapshot(ctx);

        return <T extends EComponentType>(
            { type, id }: { type: T; id: TComponentTypeToTypeId[T] },
            options: TWithTraceId,
        ): Observable<TValueDescriptor2<undefined | TComponentTypeToType[T]>> => {
            return subscribeToComponents(undefined, options).pipe(
                mapValueDescriptor(({ value }) => {
                    switch (type) {
                        case EComponentType.robot:
                            return createSyncedValueDescriptor(
                                value.robots.find((r) => r.id === id) as
                                    | undefined
                                    | TComponentTypeToType[T],
                            );
                        case EComponentType.mdGate:
                        case EComponentType.execGate:
                            return createSyncedValueDescriptor(
                                value.gates.find((g) => g.id === id) as
                                    | undefined
                                    | TComponentTypeToType[T],
                            );
                        default:
                            return createSyncedValueDescriptor(undefined);
                    }
                }),
            );
        };
    },
    {
        dedobs: {
            normalize: ([params]) =>
                semanticHash.get(
                    params,
                    // @ts-ignore - I dont understand why type is wrong
                    {},
                ),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
