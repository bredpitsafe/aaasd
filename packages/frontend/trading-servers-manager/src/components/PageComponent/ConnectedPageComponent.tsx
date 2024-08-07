import type { TWithClassname } from '@frontend/common/src/types/components';
import { isProdEnvironment } from '@frontend/common/src/utils/url';
import type { ReactElement } from 'react';

import { useAppLayout } from '../../hooks/useAppLayout';
import { useRouteParams } from '../../hooks/useRouteParams';
import { PageComponent } from './PageComponent';

type TConnectedPageComponentProps = TWithClassname;

export function ConnectedPageComponent(props: TConnectedPageComponentProps): ReactElement {
    const routeParams = useRouteParams();
    const { mainLayout } = useAppLayout();
    const isProd = isProdEnvironment(routeParams?.socket) ?? false;

    return (
        <PageComponent {...props} isProd={isProd} loading={mainLayout.loading}>
            {mainLayout.component}
        </PageComponent>
    );
}
