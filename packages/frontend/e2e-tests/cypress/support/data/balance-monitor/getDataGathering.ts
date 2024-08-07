import { TDataGathering } from '../../../lib/interfaces/balance-monitor/dataGathering';

export function getDataGathering(): TDataGathering {
    return {
        exchange: 'alpha',
        coin: 'ZZZ',
        available: '500.00 ($500)',
        amount: '4.1201',
        percent: '0.8%',
    };
}
