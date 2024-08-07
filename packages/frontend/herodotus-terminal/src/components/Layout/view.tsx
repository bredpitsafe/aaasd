import type { TWithTest } from '@frontend/common/e2e';
import { pickTestProps } from '@frontend/common/e2e';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import type { TWithChildren, TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import type { ReactElement } from 'react';

import type { THerodotusTerminalRoute } from '../../modules/router/def';
import { EHerodotusTerminalRoutes } from '../../modules/router/def';
import { ConnectedNav } from './components/ConnectedNav';
import { ConnectedRobotSelector } from './components/ConnectedRobotSelector';
import { cnOverlay, cnRoot } from './view.css';

export type TLayoutProps = TWithTest & TWithClassname;

type TLayoutViewProps = TLayoutProps &
    TWithChildren & {
        route?: THerodotusTerminalRoute;
        loading?: boolean;
        onResetLayout: VoidFunction;
    };

export function LayoutView(props: TLayoutViewProps): ReactElement {
    const { route, className, children, onResetLayout } = props;

    return (
        <div className={cn(cnRoot, className)} {...pickTestProps(props)}>
            <ConnectedNav onResetLayout={onResetLayout} />
            {route === undefined && (
                <LoadingOverlay className={cnOverlay} text="Loading routes..." />
            )}
            {route === EHerodotusTerminalRoutes.Default && (
                <LoadingOverlay className={cnOverlay} text="Selecting server..." />
            )}
            {route === EHerodotusTerminalRoutes.Stage && <ConnectedRobotSelector />}
            {route === EHerodotusTerminalRoutes.Robot && <div className={cnRoot}>{children}</div>}
        </div>
    );
}
