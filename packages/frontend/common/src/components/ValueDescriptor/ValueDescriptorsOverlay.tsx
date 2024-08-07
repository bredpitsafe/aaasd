import type { ReactElement } from 'react';

import { useValueDescriptorsStatus } from '../../hooks/useValueDescriptorStatus.ts';
import type { TWithChildren } from '../../types/components.ts';
import type { TComponentValueDescriptor } from '../../utils/React/useValueDescriptorObservable';
import { Error } from '../Error/view.tsx';
import { LoadingOverlay } from '../overlays/LoadingOverlay.tsx';
import { ValueDescriptorsBadge } from './ValueDescriptorsBadge.tsx';

type TValueDescriptorsOverlayProps = TWithChildren & {
    descriptors: TComponentValueDescriptor<unknown>[];
};
export const ValueDescriptorsOverlay = (props: TValueDescriptorsOverlayProps): ReactElement => {
    const { isBroken, hasPending, hasFail } = useValueDescriptorsStatus(props);
    const badge = <ValueDescriptorsBadge descriptors={props.descriptors} />;

    return (
        <>
            {badge}
            {hasPending ? (
                <LoadingOverlay text={hasFail ? 'Restoring connection...' : 'Loading...'} />
            ) : isBroken || hasFail ? (
                <Error
                    status={500}
                    title={hasFail ? 'Failed to load data' : 'Data link is broken'}
                />
            ) : (
                props.children
            )}
        </>
    );
};
