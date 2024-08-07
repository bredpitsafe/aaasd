import { TDataInternalTransfersHistory } from '../../../lib/interfaces/balance-monitor/dataInternalTransfersHistory';

export function getDataInternalTransfersHistory(): TDataInternalTransfersHistory {
    return {
        created: '',
        status: 'succeeded',
        coin: 'BBB',
        mainAccount: 'exchange1-main',
        source: 'exchange1-sub2',
        destination: 'exchange1-sub1',
        amount: '0.0001',
        transferID: '',
        stateMessage: '',
    };
}
