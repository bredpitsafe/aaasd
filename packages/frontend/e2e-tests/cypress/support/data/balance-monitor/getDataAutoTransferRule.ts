import { TDataAutoTransferRule } from '../../../lib/interfaces/balance-monitor/dataAutoTransferRule';

export function getDataAutoTransferRule(): TDataAutoTransferRule {
    return {
        created: '',
        userName: 'frontend',
        status: '',
        coinRule: 'WBN',
        sourceExchange: 'XSrcB',
        sourceAccount: 'XSrcB:acc1',
        destinationExchange: 'XDstB',
        destinationAccount: 'XDstB:acc1',
        notes: 'notes',
    };
}
