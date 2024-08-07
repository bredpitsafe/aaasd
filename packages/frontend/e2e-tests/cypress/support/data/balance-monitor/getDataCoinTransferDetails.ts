import { TDataCoinTransferDetails } from '../../../lib/interfaces/balance-monitor/dataCoinTransferDetails';

export function getDataCoinTransferDetails(): TDataCoinTransferDetails {
    return {
        coin: 'AAA',
        source: 'delta:acc1',
        destination: 'delta:acc2',
        network: 'ERC20',
        exchangeMin: '0',
        exchangeMax: '10,000',
        accountMin: '0',
        accountMax: '370.3703703703703 ($999)',
    };
}
