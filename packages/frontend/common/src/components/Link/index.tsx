import cn from 'classnames';
import type { ReactElement } from 'react';
import { BaseLink } from 'react-router5';
import type { BaseLinkProps } from 'react-router5/dist/BaseLink';

import { useModule } from '../../di/react';
import { ModuleRouter } from '../../modules/router';
import { useSyncObservable } from '../../utils/React/useSyncObservable';
import { cnLink } from './index.css';

type TLinkProps = Omit<BaseLinkProps, 'router' | 'route' | 'previousRoute'> & {
    preserveParams?: boolean;
};

export function Link(props: TLinkProps): ReactElement | null {
    const { routeParams, preserveParams, className, ...restProps } = props;
    const { router$, state$ } = useModule(ModuleRouter);
    const router = useSyncObservable(router$);
    const routeState = useSyncObservable(state$);

    if (!router || !routeState) {
        return null;
    }

    let params = routeParams;

    if (preserveParams) {
        if (params !== undefined) {
            params = { ...routeState.route?.params, ...params };
        } else {
            params = routeState.route?.params;
        }
    }

    return (
        <BaseLink
            className={cn(cnLink, className)}
            router={router}
            route={routeState.route}
            previousRoute={routeState.previousRoute}
            routeParams={params}
            {...restProps}
        />
    );
}
