import type { Nil, TimeZone } from '@common/types';
import type { Dayjs } from 'dayjs';
import { isNil } from 'lodash-es';

import { pickTestProps } from '../../../../e2e';
import {
    ETradingStatsPageProps,
    ETradingStatsSelectors,
} from '../../../../e2e/selectors/trading-stats/trading-stats.page.selectors';
import { useFunction } from '../../../utils/React/useFunction';
import { DatePicker } from '../../DatePicker';
import { Space } from '../../Space';
import { TableLabel } from '../TableLabel';

export type TTableRangeFilterProps = {
    timeZone: TimeZone;
    since?: Dayjs;
    till?: Dayjs;
    onChange: (since: undefined | Dayjs, till: undefined | Dayjs) => void;
};

export function TableLabelRangeFilter(props: TTableRangeFilterProps) {
    const onChange = useFunction((since: Nil | Dayjs, till: Nil | Dayjs) => {
        if (!isNil(since) && !isNil(till) && since.valueOf() > till.valueOf()) {
            [since, till] = [till, since];
        }

        props.onChange(since ?? undefined, till ?? undefined);
    });

    const onChangeSince = useFunction((since: null | Dayjs) => {
        if (props.since?.valueOf() === since?.valueOf()) {
            return;
        }
        onChange(since, props.till);
    });

    const onChangeTill = useFunction((till: null | Dayjs) => {
        if (props.till?.valueOf() === till?.valueOf()) {
            return;
        }
        onChange(props.since, till);
    });

    return (
        <TableLabel {...pickTestProps(props)} title="Time range filter">
            <Space size="small" direction="horizontal" align="center">
                <Space>
                    <span>Since</span>
                    <DatePicker
                        {...ETradingStatsPageProps[ETradingStatsSelectors.TradingSinceDateInput]}
                        size="small"
                        showTime
                        timeZone={props.timeZone}
                        value={props.since}
                        onChange={onChangeSince}
                    />
                </Space>
                <Space>
                    <span>Till</span>
                    <DatePicker
                        {...ETradingStatsPageProps[ETradingStatsSelectors.TradingTillDateInput]}
                        size="small"
                        showTime
                        timeZone={props.timeZone}
                        value={props.till}
                        onChange={onChangeTill}
                    />
                </Space>
            </Space>
        </TableLabel>
    );
}
