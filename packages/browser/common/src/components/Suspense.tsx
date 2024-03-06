import { isEqual, isNil } from 'lodash-es';
import { memo, Suspense as ReactSuspense } from 'react';

import { TWithChild } from '../types/components';
import { Error } from './Error/view';
import { LoadingOverlay } from './overlays/LoadingOverlay';

type TSuspenseProps = TWithChild & {
    component?: string;
};
export const Suspense = memo((props: TSuspenseProps) => {
    const { component, children } = props;

    const fallback = (
        <LoadingOverlay text={component ? `Loading ${component}...` : `Loading component...`} />
    );

    if (isNil(children)) {
        return (
            <Error title={component ? `Component ${component} not found` : `Component not found`} />
        );
    }

    return <ReactSuspense fallback={fallback}>{children}</ReactSuspense>;
}, isEqual);
