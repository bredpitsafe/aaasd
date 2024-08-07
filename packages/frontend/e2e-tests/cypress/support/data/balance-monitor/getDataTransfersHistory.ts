import { TDataTransfersHistory } from '../../../lib/interfaces/balance-monitor/dataTransfersHistory';

export function getDataTransfersHistory(): TDataTransfersHistory {
    return {
        status: 'sent',
        coin: 'WBN',
        source: 'XSrcB:acc2',
        destination: 'XDstB:acc2',
        amount: '100',
        txID: 'txid123',
        explorers: '',
    };
}
