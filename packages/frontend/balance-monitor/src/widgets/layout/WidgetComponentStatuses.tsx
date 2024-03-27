import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { TableComponentStatuses } from '../../components/Tables/TableComponentStatuses/view';
import { ModuleComponentStatuses } from '../../modules/observables/ModuleComponentStatuses';

export function WidgetComponentStatuses() {
    const { getComponentStatuses$ } = useModule(ModuleComponentStatuses);

    const traceId = useTraceId();

    const componentStatuses = useSyncObservable(
        getComponentStatuses$(traceId),
        useMemo(() => UnscDesc(null), []),
    );

    return <TableComponentStatuses componentStatusesDescriptor={componentStatuses} />;
}
