import type { TProviderInstrumentDetails } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2.ts';
import { ModuleBFF } from '../bff';
import { ModuleMock } from '../mock';
import { ModuleUpdateProviderInstrumentsOverride } from './ModuleUpdateProviderInstrumentsOverride.ts';

export const ModuleUpdateProviderInstrumentsOverrideOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const updateProviderInstrumentsOverride = ModuleUpdateProviderInstrumentsOverride(ctx);

        const { getCurrentBFFSocket$ } = ModuleBFF(ctx);
        const { mock$ } = ModuleMock(ctx);

        const bffSocket$ = getCurrentBFFSocket$();

        return (
            params: {
                instrumentIds: number[];
                providerInstrumentDetails: TProviderInstrumentDetails | undefined;
            },
            options,
        ): Observable<TValueDescriptor2<boolean>> =>
            combineLatest([bffSocket$, mock$]).pipe(
                first(),
                switchMap(([bffSocket, mock]) =>
                    updateProviderInstrumentsOverride(
                        {
                            type: 'UpdateProviderInstrumentsOverride',
                            target: bffSocket,
                            mock,
                            targets: params.instrumentIds.map((instrumentId) => ({
                                id: { type: 'instrumentId', instrumentId },
                                revisionPlatformTime: undefined,
                            })),
                            providerInstrument: params.providerInstrumentDetails,
                        },
                        { traceId: options.traceId },
                    ),
                ),
                mapValueDescriptor(() => createSyncedValueDescriptor(true)),
            );
    },
);
