import { TDashboardData } from '../../../lib/interfaces/dashboard/dashboardData';

export function getDataRobotTaskDashboard(): TDashboardData {
    return {
        URL: '/robotDashboard?socket=autocmn&robotId=3617&dashboard=T1138&focusTo=2023-04-12T16%3A26%3A52.857000000Z',
        namePanel: '',
        labelOnePanelOne: 'Q status BN.BTC-USDT:',
        labelTwoPanelOne: 'H status BN.BTC-EUR:',
        labelOnePanelTwo: 'H target BN.BTC-EUR:',
        labelTwoPanelTwo: 'Best bid BN.BTC-USDT:',
        labelOnePanelThree: 'Best ask:',
        labelTwoPanelThree: 'Buy vwap:',
        labelOnePanelFour: 'Realized premium:',
        labelTwoPanelFour: 'Instruments spread:',
    };
}
