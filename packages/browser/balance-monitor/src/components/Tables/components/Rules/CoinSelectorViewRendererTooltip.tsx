import { cnTooltip } from '@frontend/common/src/components/AgTable/tooltips/style.css';
import type { TRuleCoins } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ITooltipParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';

import { CoinSelectorView } from '../../../CoinSelectorView';

export function CoinSelectorViewRendererTooltip(params: ITooltipParams<unknown, TRuleCoins>) {
    const { value } = params;

    if (isNil(value) || !Array.isArray(value)) {
        return null;
    }

    return (
        <div className={cnTooltip}>
            <CoinSelectorView coins={value} />
        </div>
    );
}
