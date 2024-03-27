import { TDataAmountLimitsRule } from '../../../lib/interfaces/balance-monitor/dataAmountLimitsRule';

export function getDataAmountLimitsRule(): TDataAmountLimitsRule {
    return {
        created: '',
        userName: 'frontend',
        status: '',
        coinRule: 'WBN',
        sourceExchange: 'XSrcA',
        sourceAccount: 'XSrcA:acc1',
        destinationExchange: 'XTransit',
        destinationAccount: 'XTransit:acc1',
        notes: 'notes',
        minAmount: '23',
        maxAmount: '517',
    };
}
