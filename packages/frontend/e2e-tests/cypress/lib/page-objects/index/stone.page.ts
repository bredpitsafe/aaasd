import { BasePage } from '../../base.page';
import { Button } from '../../base/elements/button';
import { Text } from '../../base/elements/text';
enum EStonePageSelectors {
    Dashboard = '[href*=dashboard]',
    TradingServersManager = '[href*=trading-servers-manager]',
    HerodotusTerminal = '[href*=herodotus-terminal]',
    TradingStats = '[href*=trading-stats]',
    BacktestingManager = '[href*=backtesting]',
    BalanceMonitor = '[href*=balance-monitor]',
    WSQueryTerminal = '[href*=ws-query-terminal]',
    JsonCharts = '[href*=charter-json-viewer]',
    LoadingIcon = '[class*="anticon anticon-loading"]',
}

class StonePage extends BasePage {
    readonly dashboard = new Text(EStonePageSelectors.Dashboard, false);
    readonly tradingServersManager = new Text(EStonePageSelectors.TradingServersManager, false);
    readonly herodotusTerminal = new Text(EStonePageSelectors.HerodotusTerminal, false);
    readonly tradingStats = new Text(EStonePageSelectors.TradingStats, false);
    readonly backtestingManager = new Text(EStonePageSelectors.BacktestingManager, false);
    readonly balanceMonitor = new Text(EStonePageSelectors.BalanceMonitor, false);
    readonly wsQueryTerminal = new Text(EStonePageSelectors.WSQueryTerminal, false);
    readonly jsonCharts = new Text(EStonePageSelectors.JsonCharts, false);
    readonly loadingIcon = new Button(EStonePageSelectors.LoadingIcon, false);

    checkElementsExists(): void {
        this.dashboard.checkExists();
        this.tradingServersManager.checkExists();
        this.herodotusTerminal.checkExists();
        this.tradingStats.checkExists();
        this.backtestingManager.checkExists();
        this.backtestingManager.checkExists();
    }

    open(): StonePage {
        this.visit();
        return this;
    }
}

export const stonePage = new StonePage();
