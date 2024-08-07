import type {
    TBlockchainNetworkId,
    TExchangeId,
    TTransferAction,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';

export type TConfirmationTransferAction = Omit<TTransferAction, 'network'> &
    Partial<{
        networks: {
            network: TBlockchainNetworkId;
            networkPriority: number;
        }[];
        fromExchange: TExchangeId;
        toExchange: TExchangeId;
    }>;
