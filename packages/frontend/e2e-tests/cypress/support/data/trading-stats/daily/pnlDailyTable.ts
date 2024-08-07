import { TPnlTableData } from '../../../../lib/interfaces/trading-stats/pnlTableData';

export function getDataPNLTable(): TPnlTableData {
    return {
        strategy: 'sA',
        name: 'BTC',
        balStart: '0',
        balNowEnd: '-13.28166',
        balance: '-13.28166',
        balEquiv: '-$361.63k',
        usdEst: '-$361.63k',
        rateStart: '25738.14',
        rateEnd: '27227.72',
        rate: '1489.58',
        ratePercent: '5.79%',
    };
}
