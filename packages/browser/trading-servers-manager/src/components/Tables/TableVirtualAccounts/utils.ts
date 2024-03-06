import {
    TNestedVirtualAccount,
    TRealAccount,
    TVirtualAccount,
} from '@frontend/common/src/types/domain/account';
import { RowClassParams } from 'ag-grid-community';
import { RowClassRules } from 'ag-grid-community/dist/lib/entities/gridOptions';
import { isNil } from 'lodash-es';

import { cnPinnedRow } from './utils.css';

export function getAccountsRowClassRules<
    T extends TRealAccount | TVirtualAccount | TNestedVirtualAccount,
>(): RowClassRules<T> {
    return {
        [cnPinnedRow]: (params: RowClassParams<T>) => !isNil(params.node.rowPinned),
    };
}
