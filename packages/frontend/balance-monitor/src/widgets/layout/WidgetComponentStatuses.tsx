import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';

import { TableComponentStatuses } from '../../components/Tables/TableComponentStatuses/view';
import { ModuleSubscribeToComponentStatusesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToComponentStatusesOnCurrentStage.ts';

export function WidgetComponentStatuses() {
    const subscribeToComponentStatuses = useModule(
        ModuleSubscribeToComponentStatusesOnCurrentStage,
    );

    const traceId = useTraceId();

    const componentStatuses = useNotifiedValueDescriptorObservable(
        subscribeToComponentStatuses(undefined, { traceId }),
    );

    return <TableComponentStatuses componentStatusesDescriptor={componentStatuses} />;
}
