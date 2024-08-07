import { TDataSuggestedTransfer } from '../../../lib/interfaces/balance-monitor/dataSuggestedTransfer';

export function getDataSuggestedTransfer(): TDataSuggestedTransfer {
    return {
        coin: 'AAA',
        source: 'epsilon:transit',
        destination: 'delta:acc2',
        available: '5,000.00 ($13,500)',
        minAmount: '0.00',
        maxAmount: '370.37 ($999)',
        transferAmount: '4,990.00 ($13,473)',
        transferRoundAmount: '4,990',
        account: '99.8%',
        amount: '4990',
        creationMode: 'Suggest Accepted',
    };
}
