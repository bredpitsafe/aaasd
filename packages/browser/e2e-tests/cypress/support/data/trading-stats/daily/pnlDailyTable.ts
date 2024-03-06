import { TPnlTableData } from '../../../../lib/interfaces/trading-stats/pnlTableData';

export function getDataPNLTable(): TPnlTableData {
    return {
        strategy: 'sA',
        name: 'BTC',
        balStart: '0',
        balNowEnd: '-948.16131',
        balance: '-948.1613',
        balEquiv: '-$24.40M',
        usdEst: '-$24.40M',
        priceStart: '27127.71',
        priceEnd: '25738.14',
        price: '-1389.57',
        pricePercent: '-5.12%',
    };
}
