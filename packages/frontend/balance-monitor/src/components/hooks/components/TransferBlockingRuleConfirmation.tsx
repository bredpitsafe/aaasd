import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import { Descriptions } from '@frontend/common/src/components/Descriptions';
import type {
    TTransferBlockingRuleCreate,
    TTransferBlockingRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { DisabledGroupsSelectorView } from '../../DisabledGroupsSelectorView';
import { CommonRuleConfirmation } from './CommonRuleConfirmation';

export const TransferBlockingRuleConfirmation = memo(
    (
        props: (TTransferBlockingRuleCreate | TTransferBlockingRuleUpdate) & { timeZone: TimeZone },
    ) => {
        const {
            coinsMatchRule,
            source,
            destination,
            withOpposite,
            showAlert,
            note,
            disabledGroups,
            since,
            until,
            timeZone,
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
                <Descriptions.Item label="Show alert">{showAlert ? 'On' : 'Off'}</Descriptions.Item>

                <Descriptions.Item label="Disabled">
                    <DisabledGroupsSelectorView disabledGroups={disabledGroups} />
                </Descriptions.Item>

                <Descriptions.Item label="Since">
                    {isNil(since)
                        ? '—'
                        : toDayjsWithTimezone(since, timeZone).format(EDateTimeFormats.DateTime)}
                </Descriptions.Item>

                <Descriptions.Item label="Until">
                    {isNil(until)
                        ? '—'
                        : toDayjsWithTimezone(until, timeZone).format(EDateTimeFormats.DateTime)}
                </Descriptions.Item>
            </CommonRuleConfirmation>
        );
    },
);
