import type { RowClassParams, RowClassRules } from '@frontend/ag-grid';
import type {
    TNestedVirtualAccount,
    TRealAccount,
    TVirtualAccount,
} from '@frontend/common/src/types/domain/account';
import { isNil } from 'lodash-es';

import { cnPinnedRow } from './utils.css';

export function getAccountsRowClassRules<
    T extends TRealAccount | TVirtualAccount | TNestedVirtualAccount,
>(): RowClassRules<T> {
    return {
        [cnPinnedRow]: (params: RowClassParams<T>) => !isNil(params.node.rowPinned),
    };
}
