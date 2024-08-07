import { Descriptions } from '@frontend/common/src/components/Descriptions';
import type {
    TAmountLimitsRuleCreate,
    TAmountLimitsRuleUpdate,
    TCoinConvertRate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { memo } from 'react';

import { AmountWithUsdAmount } from '../../AmountWithUsdAmount';
import { CommonRuleConfirmation } from './CommonRuleConfirmation';

export const AmountLimitsRuleConfirmation = memo(
    (
        props: (TAmountLimitsRuleCreate | TAmountLimitsRuleUpdate) & {
            convertRate: TCoinConvertRate | undefined;
        },
    ) => {
        const {
            convertRate,
            coinsMatchRule,
            source,
            destination,
            withOpposite,
            amountMin,
            amountMax,
            amountCurrency,
            note,
        } = props;

        return (
            <CommonRuleConfirmation
                id={'id' in props ? props.id : undefined}
                coin={coinsMatchRule}
                source={source}
                destination={destination}
                withOpposite={withOpposite}
                note={note}
            >
                <Descriptions.Item label="Amount Min">
                    <AmountWithUsdAmount
                        amount={amountMin}
                        coin={amountCurrency}
                        convertRate={convertRate}
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Amount Max">
                    <AmountWithUsdAmount
                        amount={amountMax}
                        coin={amountCurrency}
                        convertRate={convertRate}
                    />
                </Descriptions.Item>
            </CommonRuleConfirmation>
        );
    },
);
