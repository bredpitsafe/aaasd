import { generateTraceId } from '@common/utils';
import { ValueDescriptorsBadge } from '@frontend/common/src/components/ValueDescriptor/ValueDescriptorsBadge.tsx';
import { isLoadingValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { TableUsers } from '../components/Tables/TableUsers/view.tsx';
import { useAuthUserTableItems } from '../hooks/useAuthUserTableItems.ts';

export function WidgetTableUsers() {
    const items = useAuthUserTableItems({ traceId: generateTraceId() });

    return (
        <>
            <ValueDescriptorsBadge descriptors={[items]} />
            <TableUsers items={items.value} isLoading={isLoadingValueDescriptor(items)} />
        </>
    );
}
