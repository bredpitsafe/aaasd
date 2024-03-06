import { THerodotusTerminalTaskData } from '../../../lib/interfaces/herodotus-terminal/herodotusTerminalTaskData';

export function getDataTaskNewTask(): THerodotusTerminalTaskData {
    return {
        idTask: '',
        statusTask: 'Finished',
        typeTask: 'Sell',
        amntTask: '0.034',
        assetTask: 'ETH',
        progressTask: '0% [0 / 0.034]',
        realizedPremiumTask: '—',
        aggrTask: '90%',
        orderSizeTask: '0.034',
        priceLimitTask: '$2,230.0',
        maxPremiumTask: '',
        updatedTask: '2023-06-01 09:48:20',
        avgPriceTask: '—',
        volumeTask: '0',
        side: 'Sell',
        role: 'Quote',
        name: 'BinanceSpot | hero.bn | ETHUSDT',
        amount: '0',
        target: '—',
        order: '—',
        average: '—',
        avgPrice: '—',
        volume: '0',
        aggr: '',
        status: '',
    };
}
