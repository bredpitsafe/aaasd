import { TDataInternalTransfers } from '../../../lib/interfaces/balance-monitor/dataInternalTransfers';

export function getDataInternalTransfers(): TDataInternalTransfers {
    return {
        account: 'exchange1-main',
        from: 'exchange1-sub1',
        fromSection: 'spot',
        to: 'exchange1-sub2',
        toSection: 'spot',
        coin: 'BBB',
        available: '',
        amount: '0.0001',
        percent: '',
    };
}
