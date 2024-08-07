import { TDashboardData } from '../../../lib/interfaces/dashboard/dashboardData';

export function getDataServerDashboard(): TDashboardData {
    return {
        URL: '/dashboard?serverId=27903',
        namePanel: 'Name Panel',
        labelOnePanelOne: 'Hero.t_1.ETHAUD|BinanceSpot.hero.bn.trade:',
        labelTwoPanelOne: 'Hero.t_14.filled_amount.usd:',
        labelOnePanelTwo: 'BinanceSpot.hero.bn.trade',
        labelTwoPanelTwo: 'filled_amount.usd',
        labelOnePanelThree: 'Hero.t_8.min_price:',
        labelTwoPanelThree: 'Hero.t_11.filled_amount.usd:',
        labelOnePanelFour: 'Hero.t_11.usd:',
        labelTwoPanelFour: 'ETHAUD',
    };
}
