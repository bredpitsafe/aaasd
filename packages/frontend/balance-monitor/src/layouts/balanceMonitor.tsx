import { Suspense } from '@frontend/common/src/components/Suspense';
import type { TPageLayoutFactory } from '@frontend/common/src/modules/layouts/data';
import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import type { EBalanceMonitorLayoutPermissions } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TabNode } from 'flexlayout-react';
import type { ITitleObject } from 'flexlayout-react/src/view/Layout';
import type { ReactElement, ReactNode } from 'react';
import { memo } from 'react';
import { lazily } from 'react-lazily';

import { commonLayoutFactory, commonTitleFactory } from './common';
import { EBalanceMonitorLayoutComponents } from './defs';

const { WidgetCoinTransferDetails } = lazily(
    () => import('../widgets/layout/WidgetCoinTransferDetails'),
);
const { WidgetDistribution } = lazily(() => import('../widgets/layout/WidgetDistribution'));
const { WidgetManualTransfer } = lazily(() => import('../widgets/layout/WidgetManualTransfer'));
const { WidgetSendDataToAnalyse } = lazily(
    () => import('../widgets/layout/WidgetSendDataToAnalyse'),
);
const { WidgetSuggestedTransfers } = lazily(
    () => import('../widgets/layout/WidgetSuggestedTransfers'),
);
const { WidgetTransfersHistory } = lazily(() => import('../widgets/layout/WidgetTransfersHistory'));
const { WidgetGathering } = lazily(() => import('../widgets/layout/WidgetGathering'));

export function getDefaultBalanceMonitorLayout() {
    return createLayout([
        {
            type: 'row',
            weight: 120,
            children: [
                {
                    type: 'tabset',
                    children: [
                        {
                            type: 'tab',
                            id: EBalanceMonitorLayoutComponents.SuggestedTransfers,
                            component: EBalanceMonitorLayoutComponents.SuggestedTransfers,
                            name: EBalanceMonitorLayoutComponents.SuggestedTransfers,
                        },
                    ],
                },
                {
                    type: 'tabset',
                    height: 270,
                    children: [
                        {
                            type: 'tab',
                            id: EBalanceMonitorLayoutComponents.ManualTransfer,
                            component: EBalanceMonitorLayoutComponents.ManualTransfer,
                            name: EBalanceMonitorLayoutComponents.ManualTransfer,
                        },
                        {
                            type: 'tab',
                            id: EBalanceMonitorLayoutComponents.SendDataToAnalyse,
                            component: EBalanceMonitorLayoutComponents.SendDataToAnalyse,
                            name: EBalanceMonitorLayoutComponents.SendDataToAnalyse,
                        },
                        {
                            type: 'tab',
                            id: EBalanceMonitorLayoutComponents.Gathering,
                            component: EBalanceMonitorLayoutComponents.Gathering,
                            name: EBalanceMonitorLayoutComponents.Gathering,
                        },
                    ],
                },
            ],
        },
        {
            type: 'row',
            children: [
                {
                    type: 'tabset',
                    children: [
                        {
                            type: 'tab',
                            id: EBalanceMonitorLayoutComponents.TransfersHistory,
                            component: EBalanceMonitorLayoutComponents.TransfersHistory,
                            name: EBalanceMonitorLayoutComponents.TransfersHistory,
                        },
                        {
                            type: 'tab',
                            id: EBalanceMonitorLayoutComponents.CoinTransferDetails,
                            component: EBalanceMonitorLayoutComponents.CoinTransferDetails,
                            name: EBalanceMonitorLayoutComponents.CoinTransferDetails,
                        },
                    ],
                },
                {
                    type: 'tabset',
                    height: 450,
                    children: [
                        {
                            type: 'tab',
                            id: EBalanceMonitorLayoutComponents.Distribution,
                            component: EBalanceMonitorLayoutComponents.Distribution,
                            name: EBalanceMonitorLayoutComponents.Distribution,
                        },
                    ],
                },
            ],
        },
    ]);
}

const BalanceMonitorDefaultLayout = memo(
    ({
        component,
        permissions,
    }: {
        component: string | undefined;
        permissions: EBalanceMonitorLayoutPermissions[];
    }): ReactElement => {
        let element: ReactElement | null = null;

        switch (component) {
            case EBalanceMonitorLayoutComponents.SuggestedTransfers: {
                element = <WidgetSuggestedTransfers />;
                break;
            }

            case EBalanceMonitorLayoutComponents.Distribution: {
                element = <WidgetDistribution />;
                break;
            }

            case EBalanceMonitorLayoutComponents.ManualTransfer: {
                element = <WidgetManualTransfer />;
                break;
            }

            case EBalanceMonitorLayoutComponents.TransfersHistory: {
                element = <WidgetTransfersHistory />;
                break;
            }

            case EBalanceMonitorLayoutComponents.CoinTransferDetails: {
                element = <WidgetCoinTransferDetails />;
                break;
            }

            case EBalanceMonitorLayoutComponents.SendDataToAnalyse: {
                element = <WidgetSendDataToAnalyse />;
                break;
            }

            case EBalanceMonitorLayoutComponents.Gathering: {
                element = <WidgetGathering />;
                break;
            }
        }

        return (
            <Suspense component={component}>
                {element ?? commonLayoutFactory(component, permissions)}
            </Suspense>
        );
    },
);

export function balanceMonitorLayoutFactory(
    permissions: EBalanceMonitorLayoutPermissions[],
): TPageLayoutFactory {
    return (node) => (
        <BalanceMonitorDefaultLayout component={node.getComponent()} permissions={permissions} />
    );
}

export function balanceMonitorTitleFactory(
    permissions: EBalanceMonitorLayoutPermissions[],
): (node: TabNode) => ITitleObject | ReactNode {
    return function (node: TabNode) {
        const component = node.getComponent();

        switch (component) {
            case EBalanceMonitorLayoutComponents.SuggestedTransfers: {
                return 'Suggested Transfers';
            }

            case EBalanceMonitorLayoutComponents.Distribution: {
                return 'Distribution';
            }

            case EBalanceMonitorLayoutComponents.ManualTransfer: {
                return 'Manual Transfer';
            }

            case EBalanceMonitorLayoutComponents.TransfersHistory: {
                return 'Transfers History';
            }

            case EBalanceMonitorLayoutComponents.CoinTransferDetails: {
                return 'Coin Transfer Details';
            }

            case EBalanceMonitorLayoutComponents.SendDataToAnalyse: {
                return 'Send data to analyse';
            }

            case EBalanceMonitorLayoutComponents.Gathering: {
                return 'Gathering';
            }

            default:
                return component ?? commonTitleFactory(node, permissions);
        }
    };
}
