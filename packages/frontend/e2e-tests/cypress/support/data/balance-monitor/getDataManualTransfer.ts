import { TDataManualTransfer } from '../../../lib/interfaces/balance-monitor/dataManualTransfer';

export function getDataManualTransfer(): TDataManualTransfer {
    return {
        coin: 'AAA',
        source: 'delta:acc1',
        destination: 'delta:acc1',
        available: '15,000.00 ($40,500)',
        amount: '150.1501',
        percent: '1.0%',
        status: 'starting',
        creationMode: 'Manual',
    };
}
