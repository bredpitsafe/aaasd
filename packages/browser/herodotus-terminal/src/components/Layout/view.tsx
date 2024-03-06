import { pickTestProps, TWithTest } from '@frontend/common/e2e';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { TWithChildren, TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import { ReactElement } from 'react';

import { EHerodotusTerminalRoutes, THerodotusTerminalRoute } from '../../modules/router/def';
import { ConnectedNav } from './components/ConnectedNav';
import { ConnectedRobotSelector } from './components/ConnectedRobotSelector';
import { cnOverlay, cnRoot } from './view.css';

export type TLayoutProps = TWithTest & TWithClassname;

type TLayoutViewProps = TLayoutProps &
    TWithChildren & {
        route?: THerodotusTerminalRoute;
        loading?: boolean;
        onResetLayout: () => void;
    };

export function LayoutView(props: TLayoutViewProps): ReactElement {
    const { route, className, onResetLayout, children } = props;

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
