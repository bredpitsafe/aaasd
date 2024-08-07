import { Descriptions } from '@frontend/common/src/components/Descriptions';
import type { TWithChildren } from '@frontend/common/src/types/components';
import type {
    TRuleCoins,
    TRuleId,
    TRuleVertex,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { AccountSelectorView } from '../../AccountSelectorView';
import { CoinSelectorView } from '../../CoinSelectorView';
import { ExchangeSelectorView } from '../../ExchangeSelectorView';

export const CommonRuleConfirmation = memo(
    ({
        children,
        id,
        coin,
        source,
        destination,
        withOpposite,
        note,
    }: TWithChildren & {
        id?: TRuleId;
        coin: TRuleCoins;
        source: TRuleVertex;
        destination: TRuleVertex;
        withOpposite: boolean;
        note?: string;
    }) => {
        return (
            <Descriptions bordered layout="horizontal" column={1} size="small">
                {!isNil(id) && <Descriptions.Item label="ID">{id}</Descriptions.Item>}

                <Descriptions.Item label="Coin">
                    <CoinSelectorView coins={coin} />
                </Descriptions.Item>

                <Descriptions.Item label="Source Exchange">
                    <ExchangeSelectorView exchanges={source.exchangesMatchRule} />
                </Descriptions.Item>

                <Descriptions.Item label="Source Account">
                    <AccountSelectorView accounts={source.accountsMatchRule} />
                </Descriptions.Item>

                <Descriptions.Item label="Destination Exchange">
                    <ExchangeSelectorView exchanges={destination.exchangesMatchRule} />
                </Descriptions.Item>

                <Descriptions.Item label="Destination Account">
                    <AccountSelectorView accounts={destination.accountsMatchRule} />
                </Descriptions.Item>

                <Descriptions.Item label="Both directions">
                    {withOpposite ? 'On' : 'Off'}
                </Descriptions.Item>

                {children}

                <Descriptions.Item label="Notes">{note ?? ''}</Descriptions.Item>
            </Descriptions>
        );
    },
);
