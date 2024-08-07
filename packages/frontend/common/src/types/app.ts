import { EApplicationName, EApplicationTitle, EApplicationURL } from '@common/types';

type TApp = {
    name: EApplicationName;
    title: EApplicationTitle;
    url: EApplicationURL;
};

export const UI_APPS: TApp[] = [
    {
        name: EApplicationName.Dashboard,
        title: EApplicationTitle.Dashboard,
        url: EApplicationURL.Dashboard,
    },
    {
        name: EApplicationName.TradingServersManager,
        title: EApplicationTitle.TradingServersManager,
        url: EApplicationURL.TradingServersManager,
    },
    {
        name: EApplicationName.HerodotusTerminal,
        title: EApplicationTitle.HerodotusTerminal,
        url: EApplicationURL.HerodotusTerminal,
    },
    {
        name: EApplicationName.TradingStats,
        title: EApplicationTitle.TradingStats,
        url: EApplicationURL.TradingStats,
    },
    {
        name: EApplicationName.BacktestingManager,
        title: EApplicationTitle.BacktestingManager,
        url: EApplicationURL.BacktestingManager,
    },
    {
        name: EApplicationName.BalanceMonitor,
        title: EApplicationTitle.BalanceMonitor,
        url: EApplicationURL.BalanceMonitor,
    },
    {
        name: EApplicationName.WSQueryTerminal,
        title: EApplicationTitle.WSQueryTerminal,
        url: EApplicationURL.WSQueryTerminal,
    },
];
