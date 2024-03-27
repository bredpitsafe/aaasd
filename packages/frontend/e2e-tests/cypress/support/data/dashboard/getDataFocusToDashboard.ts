import { TDashboardData } from '../../../lib/interfaces/dashboard/dashboardData';

export function getDataFocusToDashboard(): TDashboardData {
    return {
        URL: '/robotDashboard?socket=autocmn&robotId=1017&dashboard=T0001&focusTo=2023-08-29T09%3A05%3A16.883602691Z',
        namePanel: '',
        labelOnePanelOne: 'Q status BN.BTC-USDT:',
        labelTwoPanelOne: 'Num Q instruments:',
        labelOnePanelTwo: 'Best ask BN.BTC-USDT:',
        labelTwoPanelTwo: 'Best bid BN.BTC-USDT:',
        labelOnePanelThree: 'Buy vwap:',
        labelTwoPanelThree: 'Limit price:',
        labelOnePanelFour: 'Bought for USDT:',
        labelTwoPanelFour: 'Bought BTC:',
    };
}
