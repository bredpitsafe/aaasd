import { isBoolean, isEmpty } from 'lodash-es';

import type { TBase64 } from '../../utils/base64';
import { extractValidBoolean, extractValidString } from '../../utils/extract';
import { TFilterValue } from '../clientTableFilters/data';
import { TTableState } from '../tables/data';
import { ETypicalSearchParams, TAllTypicalRouteParams, TEncodedTypicalRouteParams } from './defs';

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

    return encoded;
};

export const decodeTypicalParams = (params: TEncodedTypicalRouteParams): TAllTypicalRouteParams => {
    return {
        [ETypicalSearchParams.Socket]: extractValidString(params[ETypicalSearchParams.Socket]),
        [ETypicalSearchParams.Tab]: extractValidString(params[ETypicalSearchParams.Tab]),
        [ETypicalSearchParams.CreateTab]: extractValidBoolean(
            params[ETypicalSearchParams.CreateTab],
        ),
        [ETypicalSearchParams.TableFilter]: extractValidFilter<TFilterValue>(
            params[ETypicalSearchParams.TableFilter],
        ),
        [ETypicalSearchParams.TableState]: extractValidFilter<TTableState>(
            params[ETypicalSearchParams.TableState],
        ),
    };
};

function extractValidFilter<T>(filter: undefined | string): undefined | TBase64<T> {
    return filter === undefined ? undefined : (decodeURIComponent(filter) as TBase64<T>);
}
