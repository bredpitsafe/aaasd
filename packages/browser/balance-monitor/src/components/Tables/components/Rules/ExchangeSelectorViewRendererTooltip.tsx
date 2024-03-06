import { cnTooltip } from '@frontend/common/src/components/AgTable/tooltips/style.css';
import type { TRuleExchanges } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ITooltipParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';

import { ExchangeSelectorView } from '../../../ExchangeSelectorView';

export function ExchangeSelectorViewRendererTooltip(
    params: ITooltipParams<unknown, TRuleExchanges>,
) {
    const { value } = params;

    if (isNil(value) || !Array.isArray(value)) {
        return null;
    }

    return (
        <div className={cnTooltip}>
            <ExchangeSelectorView exchanges={value} />
        </div>
    );
}
