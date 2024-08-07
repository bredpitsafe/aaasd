import { Descriptions } from '@frontend/common/src/components/Descriptions';
import type {
    TAutoTransferRuleCreate,
    TAutoTransferRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { memo } from 'react';

import { CommonRuleConfirmation } from './CommonRuleConfirmation';

export const AutoTransferRuleConfirmation = memo(
    (props: TAutoTransferRuleCreate | TAutoTransferRuleUpdate) => {
        const { coinsMatchRule, source, destination, withOpposite, note, enableAuto } = props;

        return (
            <CommonRuleConfirmation
                id={'id' in props ? props.id : undefined}
                coin={coinsMatchRule}
                source={source}
                destination={destination}
                withOpposite={withOpposite}
                note={note}
            >
                <Descriptions.Item label="Auto Transfer">
                    {enableAuto ? 'Enabled' : 'Disabled'}
                </Descriptions.Item>
            </CommonRuleConfirmation>
        );
    },
);
