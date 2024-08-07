import { generateTraceId } from '@common/utils';
import { ValueDescriptorsBadge } from '@frontend/common/src/components/ValueDescriptor/ValueDescriptorsBadge';
import { isLoadingValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';

import { TableGroups } from '../components/Tables/TableGroups/view';
import { useAuthGroupTableItems } from '../hooks/useAuthGroupTableItems';

export function WidgetTableGroups() {
    const items = useAuthGroupTableItems({ traceId: generateTraceId() });

    return (
        <>
            <ValueDescriptorsBadge descriptors={[items]} />
            <TableGroups items={items.value} isLoading={isLoadingValueDescriptor(items)} />
        </>
    );
}
