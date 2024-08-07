import type { TBase64 } from '@common/utils/src/base64.ts';
import { extractValidBoolean, extractValidString } from '@common/utils/src/extract.ts';
import { isBoolean, isEmpty } from 'lodash-es';

import type { TFilterValue } from '../clientTableFilters/data';
import type { TTableState } from '../tables/data';
import type { TAllTypicalRouteParams, TEncodedTypicalRouteParams } from './defs';
import { ETypicalSearchParams } from './defs';

export const encodeTypicalParams = (params: TAllTypicalRouteParams): TEncodedTypicalRouteParams => {
    const encoded: TEncodedTypicalRouteParams = {};

    if (ETypicalSearchParams.Socket in params) {
        encoded[ETypicalSearchParams.Socket] = params[ETypicalSearchParams.Socket];
    }

    if (ETypicalSearchParams.Tab in params && !isEmpty(params[ETypicalSearchParams.Tab])) {
        encoded[ETypicalSearchParams.Tab] = String(params[ETypicalSearchParams.Tab]);
    }

    if (
        ETypicalSearchParams.CreateTab in params &&
        isBoolean(params[ETypicalSearchParams.CreateTab])
    ) {
        encoded[ETypicalSearchParams.CreateTab] = String(params[ETypicalSearchParams.CreateTab]);
    }

    if (
        ETypicalSearchParams.SingleTab in params &&
        isBoolean(params[ETypicalSearchParams.SingleTab])
    ) {
        encoded[ETypicalSearchParams.SingleTab] = String(params[ETypicalSearchParams.SingleTab]);
    }

    if (
        ETypicalSearchParams.TableFilter in params &&
        !isEmpty(params[ETypicalSearchParams.TableFilter])
    ) {
        encoded[ETypicalSearchParams.TableFilter] = String(
            params[ETypicalSearchParams.TableFilter],
        );
    }

    if (
        ETypicalSearchParams.TableState in params &&
        !isEmpty(params[ETypicalSearchParams.TableState])
    ) {
        encoded[ETypicalSearchParams.TableState] = String(params[ETypicalSearchParams.TableState]);
    }

    if (ETypicalSearchParams.Mock in params && isBoolean(params[ETypicalSearchParams.Mock])) {
        encoded[ETypicalSearchParams.Mock] = String(params[ETypicalSearchParams.Mock]);
    }

    return encoded;
};

export const decodeTypicalParams = (params: TEncodedTypicalRouteParams): TAllTypicalRouteParams => {
    return {
        [ETypicalSearchParams.Socket]: extractValidString(params[ETypicalSearchParams.Socket]),
        [ETypicalSearchParams.Tab]: extractValidString(params[ETypicalSearchParams.Tab]),
        [ETypicalSearchParams.CreateTab]: extractValidBoolean(
            params[ETypicalSearchParams.CreateTab],
        ),
        [ETypicalSearchParams.SingleTab]: extractValidBoolean(
            params[ETypicalSearchParams.SingleTab],
        ),
        [ETypicalSearchParams.TableFilter]: extractValidFilter<TFilterValue>(
            params[ETypicalSearchParams.TableFilter],
        ),
        [ETypicalSearchParams.TableState]: extractValidFilter<TTableState>(
            params[ETypicalSearchParams.TableState],
        ),
        [ETypicalSearchParams.Mock]: extractValidBoolean(params[ETypicalSearchParams.Mock]),
    };
};

export function extractValidFilter<T>(filter: undefined | string): undefined | TBase64<T> {
    return filter === undefined ? undefined : (decodeURIComponent(filter) as TBase64<T>);
}
