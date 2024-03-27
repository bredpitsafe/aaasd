import type { ITooltipParams } from '@frontend/ag-grid';
import { cnTooltip } from '@frontend/common/src/components/AgTable/tooltips/style.css';
import type { TRuleAccounts } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';

import { AccountSelectorView } from '../../../AccountSelectorView';

export function AccountSelectorViewRendererTooltip(params: ITooltipParams<unknown, TRuleAccounts>) {
    const { value } = params;

    if (isNil(value) || !Array.isArray(value)) {
        return null;
    }

    return (
        <div className={cnTooltip}>
            <AccountSelectorView accounts={value} />
        </div>
    );
}
