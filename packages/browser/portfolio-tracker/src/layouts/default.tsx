import { Suspense } from '@frontend/common/src/components/Suspense';
import type { TPageLayoutFactory } from '@frontend/common/src/modules/layouts/data';
import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import { cnFit } from '@frontend/common/src/utils/css/common.css';
import { memo, ReactElement } from 'react';
import { lazily } from 'react-lazily';

const { ConnectedPortfolioFilter } = lazily(
    () => import('../components/Layout/components/ConnectedPortfolioFilter'),
);
const { ConnectedTablePortfolioGamma } = lazily(
    () => import('../components/Layout/components/ConnectedTablePortfolioGamma'),
);
const { ConnectedTablePortfolioPositions } = lazily(
    () => import('../components/Layout/components/ConnectedTablePortfolioPositions'),
);
const { ConnectedTablePortfolioPV } = lazily(
    () => import('../components/Layout/components/ConnectedTablePortfolioPV'),
);
const { ConnectedTablePortfolioRho } = lazily(
    () => import('../components/Layout/components/ConnectedTablePortfolioRho'),
);
const { ConnectedTablePortfolioRisks } = lazily(
    () => import('../components/Layout/components/ConnectedTablePortfolioRisks'),
);
const { ConnectedTablePortfolioTrades } = lazily(
    () => import('../components/Layout/components/ConnectedTablePortfolioTrades'),
);
const { ConnectedTablePortfolioVega } = lazily(
    () => import('../components/Layout/components/ConnectedTablePortfolioVega'),
);

enum EDefaultLayoutComponents {
    PortfolioFilter = 'PortfolioFilter',
    PortfolioTrades = 'PortfolioTrades',
    PortfolioPositions = 'PortfolioPositions',
    PortfolioRisks = 'PortfolioRisks',
    PortfolioRho = 'PortfolioRho',
    PortfolioVega = 'PortfolioVega',
    PortfolioGamma = 'PortfolioGamma',
    PortfolioPV = 'PortfolioPV',
}

const componentToTabNameRecord = {
    [EDefaultLayoutComponents.PortfolioFilter]: 'Filter',
    [EDefaultLayoutComponents.PortfolioTrades]: 'Trades',
    [EDefaultLayoutComponents.PortfolioPositions]: 'Positions',
    [EDefaultLayoutComponents.PortfolioRisks]: 'Risks',
    [EDefaultLayoutComponents.PortfolioRho]: 'Rho',
    [EDefaultLayoutComponents.PortfolioVega]: 'Vega',
    [EDefaultLayoutComponents.PortfolioGamma]: 'Gamma',
    [EDefaultLayoutComponents.PortfolioPV]: 'PV',
};

export const defaultLayoutComponents = Object.values(EDefaultLayoutComponents);

export const defaultLayout = createLayout([
    {
        type: 'row',
        children: [
            {
                type: 'row',
                weight: 60,
                children: [
                    {
                        type: 'tabset',
                        children: [
                            {
                                type: 'tab',
                                id: EDefaultLayoutComponents.PortfolioFilter,
                                name: componentToTabNameRecord[
                                    EDefaultLayoutComponents.PortfolioFilter
                                ],
                                component: EDefaultLayoutComponents.PortfolioFilter,
                                enableClose: false,
                            },
                            {
                                type: 'tab',
                                id: EDefaultLayoutComponents.PortfolioTrades,
                                name: componentToTabNameRecord[
                                    EDefaultLayoutComponents.PortfolioTrades
                                ],
                                component: EDefaultLayoutComponents.PortfolioTrades,
                            },
                            {
                                type: 'tab',
                                id: EDefaultLayoutComponents.PortfolioPositions,
                                name: componentToTabNameRecord[
                                    EDefaultLayoutComponents.PortfolioPositions
                                ],
                                component: EDefaultLayoutComponents.PortfolioPositions,
                            },
                            {
                                type: 'tab',
                                id: EDefaultLayoutComponents.PortfolioRisks,
                                name: componentToTabNameRecord[
                                    EDefaultLayoutComponents.PortfolioRisks
                                ],
                                component: EDefaultLayoutComponents.PortfolioRisks,
                            },
                            {
                                type: 'tab',
                                id: EDefaultLayoutComponents.PortfolioVega,
                                name: componentToTabNameRecord[
                                    EDefaultLayoutComponents.PortfolioVega
                                ],
                                component: EDefaultLayoutComponents.PortfolioVega,
                            },
                            {
                                type: 'tab',
                                id: EDefaultLayoutComponents.PortfolioRho,
                                name: componentToTabNameRecord[
                                    EDefaultLayoutComponents.PortfolioRho
                                ],
                                component: EDefaultLayoutComponents.PortfolioRho,
                            },
                            {
                                type: 'tab',
                                id: EDefaultLayoutComponents.PortfolioGamma,
                                name: componentToTabNameRecord[
                                    EDefaultLayoutComponents.PortfolioGamma
                                ],
                                component: EDefaultLayoutComponents.PortfolioGamma,
                            },
                            {
                                type: 'tab',
                                id: EDefaultLayoutComponents.PortfolioPV,
                                name: componentToTabNameRecord[
                                    EDefaultLayoutComponents.PortfolioPV
                                ],
                                component: EDefaultLayoutComponents.PortfolioPV,
                            },
                        ],
                    },
                ],
            },
        ],
    },
]);

const PortfolioTrackerDefaultLayout = memo(
    (props: { component: string | undefined }): ReactElement => {
        const { component } = props;
        let element: ReactElement | null = null;
        switch (component) {
            case EDefaultLayoutComponents.PortfolioFilter: {
                element = <ConnectedPortfolioFilter />;
                break;
            }
            case EDefaultLayoutComponents.PortfolioPositions: {
                element = <ConnectedTablePortfolioPositions className={cnFit} />;
                break;
            }
            case EDefaultLayoutComponents.PortfolioTrades: {
                element = <ConnectedTablePortfolioTrades className={cnFit} />;
                break;
            }
            case EDefaultLayoutComponents.PortfolioRisks: {
                element = <ConnectedTablePortfolioRisks className={cnFit} />;
                break;
            }
            case EDefaultLayoutComponents.PortfolioVega: {
                element = <ConnectedTablePortfolioVega className={cnFit} />;
                break;
            }
            case EDefaultLayoutComponents.PortfolioRho: {
                element = <ConnectedTablePortfolioRho className={cnFit} />;
                break;
            }
            case EDefaultLayoutComponents.PortfolioGamma: {
                element = <ConnectedTablePortfolioGamma className={cnFit} />;
                break;
            }
            case EDefaultLayoutComponents.PortfolioPV: {
                element = <ConnectedTablePortfolioPV className={cnFit} />;
                break;
            }
        }

        return <Suspense component={props.component}>{element}</Suspense>;
    },
);

export const defaultLayoutFactory: TPageLayoutFactory = (node) => {
    const component = node.getComponent();
    return <PortfolioTrackerDefaultLayout component={component} />;
};
