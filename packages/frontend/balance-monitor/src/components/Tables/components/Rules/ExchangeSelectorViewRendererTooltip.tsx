import type { ITooltipParams } from '@frontend/ag-grid';
import { cnTooltip } from '@frontend/common/src/components/AgTable/tooltips/style.css';
import type { TRuleExchanges } from '@frontend/common/src/types/domain/balanceMonitor/defs';
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
