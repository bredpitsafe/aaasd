import { Suspense } from '@frontend/common/src/components/Suspense';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithChild } from '@frontend/common/src/types/components';
import { EComponentConfigType } from '@frontend/common/src/types/domain/component';
import { getWSQueryTerminalUrl } from '@frontend/common/src/utils/urlBuilders';
import { isNil, isObject } from 'lodash-es';
import { memo, ReactElement } from 'react';
import { lazily } from 'react-lazily';

import { isUrlFrameConfig } from './herodotus';

const { ConnectedFrame } = lazily(
    () => import('@frontend/common/src/components/Frame/ConnectedFrame'),
);
const { ConnectedOrderBook } = lazily(
    () => import('../components/PageServer/components/ConnectedOrderBook'),
);
const { ConnectedProductLogs } = lazily(
    () => import('../components/PageServer/components/ConnectedProductLogs'),
);
const { ConnectedRealAccounts } = lazily(
    () => import('../components/PageServer/components/ConnectedRealAccounts'),
);
const { ConnectedTableIndicators } = lazily(
    () => import('../components/PageServer/components/ConnectedTableIndicators'),
);
const { ConnectedTableInstruments } = lazily(
    () => import('../components/PageServer/components/ConnectedTableInstruments'),
);
const { ConnectedVirtualAccounts } = lazily(
    () => import('../components/PageServer/components/ConnectedVirtualAccounts'),
);
const { ConnectedCreateComponent } = lazily(
    () => import('../components/PageServer/components/CreateComponent'),
);
const { WidgetBalances } = lazily(() => import('../widgets/Tabs/Common/Balances'));
const { WidgetPositions } = lazily(() => import('../widgets/Tabs/Common/Positions'));

export enum EDefaultLayoutComponents {
    Menu = 'Menu',
    Servers = 'Servers',
    ExecGates = 'Exec Gates',
    MdGates = 'MD Gates',
    Robots = 'Robots',
    Indicators = 'Indicators',
    IndicatorsDashboard = 'Indicators Dashboard',
    Instruments = 'Instruments',
    ProductLogs = 'Product Logs',
    Frame = 'Frame',
    AddComponent = 'Add Component',
    VirtualAccounts = 'Virtual Accounts',
    RealAccounts = 'Real Accounts',
    WsRequest = 'WS Request',
    OrderBook = 'Order Book',
    Positions = 'Positions',
    Balances = 'Balances',
}

export const TSMDefaultLayout = memo(
    (
        props: TWithChild & { component: string | undefined; config: unknown; id: string },
    ): ReactElement => {
        const { component, config, id, children } = props;
        const { getCurrentSocket } = useModule(ModuleSocketPage);

        let element: ReactElement | null = null;
        switch (component) {
            case EDefaultLayoutComponents.Indicators: {
                element = <ConnectedTableIndicators />;
                break;
            }
            case EDefaultLayoutComponents.Instruments: {
                element = <ConnectedTableInstruments />;
                break;
            }
            case EDefaultLayoutComponents.Frame: {
                const url = isUrlFrameConfig(config) ? config.url : undefined;
                element = <ConnectedFrame id={id} url={url} />;
                break;
            }
            case EDefaultLayoutComponents.AddComponent: {
                const configType = isAddComponentConfig(config) ? config.configType : undefined;
                element = <ConnectedCreateComponent configType={configType} />;
                break;
            }
            case EDefaultLayoutComponents.ProductLogs: {
                element = <ConnectedProductLogs />;
                break;
            }
            case EDefaultLayoutComponents.VirtualAccounts: {
                element = <ConnectedVirtualAccounts />;
                break;
            }
            case EDefaultLayoutComponents.RealAccounts: {
                element = <ConnectedRealAccounts />;
                break;
            }
            case EDefaultLayoutComponents.WsRequest: {
                const socket = getCurrentSocket();
                const url = isNil(socket) ? undefined : getWSQueryTerminalUrl(socket.name);
                element = <ConnectedFrame id={id} url={url} />;
                break;
            }
            case EDefaultLayoutComponents.OrderBook: {
                element = <ConnectedOrderBook />;
                break;
            }
            case EDefaultLayoutComponents.Positions: {
                element = <WidgetPositions />;
                break;
            }
            case EDefaultLayoutComponents.Balances: {
                element = <WidgetBalances />;
                break;
            }
            default: {
                element = <>{children}</>;
                break;
            }
        }

        return <Suspense component={props.component}>{element}</Suspense>;
    },
);

function isAddComponentConfig(config: unknown): config is {
    configType: EComponentConfigType;
} {
    if (isNil(config)) {
        return false;
    }

    return (
        isObject(config) &&
        'configType' in config &&
        Object.values(EComponentConfigType).includes(config.configType as EComponentConfigType)
    );
}
