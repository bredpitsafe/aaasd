import { createTestProps } from '@frontend/common/e2e';
import { ETradingServersManagerSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/trading-servers-manager.page.selectors';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import type { TWithChildren, TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import { memo } from 'react';

import { WidgetNav } from '../../widgets/Nav/WidgetNav';
import { cnLayout, cnNav, cnProdHighlight, cnRoot } from './PageComponent.css';

export enum ETabName {
    command = 'command',
    config = 'config',
    state = 'state',
    activeTasks = 'activeTasks',
    archivedTasks = 'archivedTasks',
    activeOrders = 'activeOrders',
    tablePositions = 'tablePositions',
    customView = 'customView',
    status = 'status',
    allIndicators = 'allIndicators',
    allInstruments = 'allInstruments',
}

type TPageComponentProps = TWithClassname &
    TWithChildren & {
        isProd: boolean;
        loading?: boolean;
    };

export const PageComponent = memo(
    ({ isProd, className, loading, children }: TPageComponentProps) => {
        return (
            <div
                {...createTestProps(ETradingServersManagerSelectors.App)}
                className={cn(className, cnRoot)}
            >
                <WidgetNav className={cn(cnNav, { [cnProdHighlight]: isProd })} />

                {loading ? (
                    <LoadingOverlay text="Loading layouts..." />
                ) : (
                    <div className={cnLayout}>{children}</div>
                )}
            </div>
        );
    },
);
