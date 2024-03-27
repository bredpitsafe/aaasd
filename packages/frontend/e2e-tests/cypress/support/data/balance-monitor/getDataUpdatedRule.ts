import { TDataAutoTransferRule } from '../../../lib/interfaces/balance-monitor/dataAutoTransferRule';

export function getDataUpdateRule(): TDataAutoTransferRule {
    return {
        created: '',
        userName: 'frontend',
        status: '',
        coinRule: 'CAA',
        sourceExchange: 'XSrcB',
        sourceAccount: 'XSrcB:acc1',
        destinationExchange: 'XDstA',
        destinationAccount: 'All',
        notes: 'notes',
    };
}
