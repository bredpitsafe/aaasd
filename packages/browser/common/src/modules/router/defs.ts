import { omit } from 'lodash-es';
import type { Route } from 'router5';

import { ValueOf } from '../../types';
import { TSocketName } from '../../types/domain/sockets';
import { TBase64 } from '../../utils/base64';
import { TFilterValue } from '../clientTableFilters/data';
import { TTableState } from '../tables/data';
import { decodeTypicalParams, encodeTypicalParams } from './encoders';
import { buildRouteQuery } from './utils';

export const ETypicalRoute = <const>{
    Default: 'default',
    Stage: 'socket',
};

export const ETypicalSearchParams = <const>{
    Socket: 'socket',
    Tab: 'tab',
    CreateTab: 'createTab',
    TableFilter: 'filter',
    TableState: 'tableState',
};

export type TTypicalDefaultRouteParams = {};

export type TTypicalStageRouteParams = TTypicalDefaultRouteParams & {
    [ETypicalSearchParams.Socket]: TSocketName;
    [ETypicalSearchParams.Tab]?: string;
    [ETypicalSearchParams.CreateTab]?: boolean;
    [ETypicalSearchParams.TableFilter]?: TBase64<TFilterValue>;
    [ETypicalSearchParams.TableState]?: TBase64<TTableState>;
};

export type TTypicalRouterData = {
    [ETypicalRoute.Default]: TTypicalDefaultRouteParams;
    [ETypicalRoute.Stage]: TTypicalStageRouteParams;
};

export type TAllTypicalRouteParams = ValueOf<TTypicalRouterData>;

export type TEncodedTypicalRouteParams = {
    [ETypicalSearchParams.Socket]?: string;
    [ETypicalSearchParams.Tab]?: string;
    [ETypicalSearchParams.CreateTab]?: string;
    [ETypicalSearchParams.TableFilter]?: string;
    [ETypicalSearchParams.TableState]?: string;
};

export const TYPICAL_GET_PARAMS = buildRouteQuery(omit(ETypicalSearchParams, 'Socket'));

export const TYPICAL_ROUTES = [
    {
        name: ETypicalRoute.Default,
        path: `/`,
    },
    {
        name: ETypicalRoute.Stage,
        path: `/:${ETypicalSearchParams.Socket}${TYPICAL_GET_PARAMS}`,
        encodeParams: encodeTypicalParams,
        decodeParams: decodeTypicalParams,
    },
] as Route[];
