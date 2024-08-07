import { TDashboardData } from '../../../lib/interfaces/dashboard/dashboardData';

export function getDataIndicatorsDashboard(): TDashboardData {
    return {
        URL: '/indicatorsDashboard?socket=autocmn&indicators=Hero.t_40.min_price&indicators=Hero.t_38.target_amount&indicators=Hero.t_36.BTCUSDT%7CBinanceSwap.hero.bns.order_price&indicators=Hero.t_55.ETHAUD%7CBinanceSpot.hero.bn.trade&indicators=Hero.t_45.ETHAUD%7CBinanceSpot.hero.bn.trade&indicators=Hero.t_39.filled_amount&indicators=Hero.t_55.target_amount&indicators=Hero.t_50.filled_amount&focusTo=2023-03-07T00%3A00%3A02.342536400Z',
        namePanel: '',
        labelOnePanelOne: 'Hero.t_40.min_price:',
        labelTwoPanelOne: 'Hero.t_38.target_amount:',
        labelOnePanelTwo: 'Hero.t_36.BTCUSDT|BinanceSwap.hero.bns.order_price:',
        labelTwoPanelTwo: 'Hero.t_55.ETHAUD|BinanceSpot.hero.bn.trade:',
        labelOnePanelThree: 'Hero.t_45.ETHAUD|BinanceSpot.hero.bn.trade:',
        labelTwoPanelThree: 'Hero.t_39.filled_amount:',
        labelOnePanelFour: 'Hero.t_55.target_amount:',
        labelTwoPanelFour: 'Hero.t_50.filled_amount:',
    };
}
