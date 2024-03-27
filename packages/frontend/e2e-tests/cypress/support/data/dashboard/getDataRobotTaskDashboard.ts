import { TDashboardData } from '../../../lib/interfaces/dashboard/dashboardData';

export function getDataRobotTaskDashboard(): TDashboardData {
    return {
        URL: '/robotDashboard?socket=autocmn&robotId=1017&dashboard=T0925&focusTo=2023-04-12T16%3A26%3A52.857000000Z',
        namePanel: '',
        labelOnePanelOne: 'Q status BS.BTC-USDT:',
        labelTwoPanelOne: 'Num Q instruments:',
        labelOnePanelTwo: 'Best ask BS.BTC-USDT:',
        labelTwoPanelTwo: 'Best bid BS.BTC-USDT:',
        labelOnePanelThree: 'Best ask:',
        labelTwoPanelThree: 'Buy vwap:',
        labelOnePanelFour: 'Bought for USDT:',
        labelTwoPanelFour: 'Bought BTC:',
    };
}
