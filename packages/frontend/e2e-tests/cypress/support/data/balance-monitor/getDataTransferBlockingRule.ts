import { TDataTransferBlockingRule } from '../../../lib/interfaces/balance-monitor/dataTransferBlockingRule';

export function getDataTransferBlockingRule(): TDataTransferBlockingRule {
    return {
        created: '',
        userName: 'frontend',
        status: '',
        coinRule: 'AAA',
        sourceExchange: 'delta',
        sourceAccount: 'delta:acc1',
        destinationExchange: 'epsilon',
        destinationAccount: 'epsilon:acc1',
        notes: 'notes',
    };
}
