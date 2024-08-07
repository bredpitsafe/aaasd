import { TDashboardData } from '../../../lib/interfaces/dashboard/dashboardData';

export function getDataRobotDashboard(): TDashboardData {
    return {
        URL: '/robotDashboard?socket=autocmn&robotId=1017&dashboard=T3397_USDC',
        namePanel: '',
        labelOnePanelOne: 'Q status BN.BTC-USDC:',
        labelTwoPanelOne: 'Num Q instruments:',
        labelOnePanelTwo: 'Q target BN.BTC-USDC:',
        labelTwoPanelTwo: 'Best bid BN.BTC-USDC:',
        labelOnePanelThree: 'Sell vwap:',
        labelTwoPanelThree: 'Best bid:',
        labelOnePanelFour: 'Max premium:',
        labelTwoPanelFour: 'Instruments spread:',
    };
}
