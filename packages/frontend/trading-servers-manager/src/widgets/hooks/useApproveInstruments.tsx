import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals.tsx';
import { ModuleApproveInstrumentsOnCurrentStage } from '@frontend/common/src/modules/instruments/ModuleApproveInstrumentsOnCurrentStage.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { of } from 'rxjs';

export function useApproveInstruments(): (instruments: TInstrument[]) => Promise<boolean> {
    const approveInstrumentsOnCurrentStage = useModule(ModuleApproveInstrumentsOnCurrentStage);

    const { confirm } = useModule(ModuleModals);

    const [approveInstruments] = useNotifiedObservableFunction(
        (instruments: TInstrument[]) =>
            instruments.length === 0
                ? of(createSyncedValueDescriptor(true))
                : approveInstrumentsOnCurrentStage(
                      instruments.map(({ id }) => id),
                      { traceId: generateTraceId() },
                  ),
        {
            mapError: () => ({ message: 'Failed to approve instruments' }),
            getNotifyTitle: (instruments) => ({
                loading: `Approving instrument${instruments.length > 0 ? 's' : ''}`,
                success: `Successfully approved instrument${instruments.length > 0 ? 's' : ''}`,
            }),
        },
    );

    return useFunction(async (instruments: TInstrument[]): Promise<boolean> => {
        if (instruments.length === 0) {
            return false;
        }

        const approved = await confirm('', {
            title: `Approve Instrument${instruments.length > 0 ? 's' : ''}`,
            width: '650px',
            content:
                instruments.length > 1 ? (
                    <p>Are you sure you want to approve {instruments.length} instruments?</p>
                ) : (
                    <p>
                        Are you sure you want to approve instrument &quot;{instruments[0].name}
                        &quot;?
                    </p>
                ),
        });

        if (!approved) {
            return false;
        }

        return approveInstruments(instruments);
    });
}
