import type { ValueOf } from '@common/types';
import type { TBase64 } from '@common/utils/src/base64.ts';
import { omit } from 'lodash-es';
import type { Route } from 'router5';

import type { TSocketName } from '../../types/domain/sockets';
import type { TFilterValue } from '../clientTableFilters/data';
import type { TTableState } from '../tables/data';
import { decodeTypicalParams, encodeTypicalParams } from './encoders';
import { buildRouteQuery } from './utils';

export const ETypicalRoute = <const>{
    Default: 'default',
    Stage: 'socket',
};

export const ELayoutSearchParams = <const>{
    Tab: 'tab',
    CreateTab: 'createTab',
    SingleTab: 'singleTab',
};

export const ETableSearchParams = <const>{
    TableFilter: 'filter',
    TableState: 'tableState',
};

export const ETypicalSearchParams = <const>{
    ...ELayoutSearchParams,
    ...ETableSearchParams,
    Socket: 'socket',
    Query: 'query',
    Mock: 'mock',
};

export type TLayoutRouteParams = {
    [ETypicalSearchParams.Tab]?: string;
    [ETypicalSearchParams.CreateTab]?: boolean;
    [ETypicalSearchParams.SingleTab]?: boolean;
};

export type TTableRouteParams = {
    [ETypicalSearchParams.TableFilter]?: TBase64<TFilterValue>;
    [ETypicalSearchParams.TableState]?: TBase64<TTableState>;
};

export type TTypicalDefaultRouteParams = {} & TLayoutRouteParams;

export type TTypicalStageRouteParams = TTypicalDefaultRouteParams &
    TTableRouteParams & {
        [ETypicalSearchParams.Socket]: TSocketName;
        [ETypicalSearchParams.Mock]?: boolean;
    };

export type TLayoutRouterData = {
    [ETypicalRoute.Default]: TTypicalDefaultRouteParams;
};

export type TTypicalRouterData = TLayoutRouterData & {
    [ETypicalRoute.Stage]: TTypicalStageRouteParams;
};

export type TAllTypicalRouteParams = ValueOf<TTypicalRouterData>;

export type TEncodedLayoutRouteParams = {
    [ETypicalSearchParams.Tab]?: string;
    [ETypicalSearchParams.CreateTab]?: string;
    [ETypicalSearchParams.SingleTab]?: string;
};

export type TEncodedTableRouteParams = {
    [ETypicalSearchParams.TableFilter]?: string;
    [ETypicalSearchParams.TableState]?: string;
};

export type TEncodedTypicalRouteParams = TEncodedLayoutRouteParams &
    TEncodedTableRouteParams & {
        [ETypicalSearchParams.Socket]?: string;
        [ETypicalSearchParams.Mock]?: string;
    };

export const TYPICAL_GET_PARAMS = buildRouteQuery(omit(ETypicalSearchParams, 'Socket'));

export const LAYOUT_ROUTES = [
    {
        name: ETypicalRoute.Default,
        path: `/`,
    },
];

export const TYPICAL_ROUTES = [
    {
        name: ETypicalRoute.Stage,
        path: `/:${ETypicalSearchParams.Socket}${TYPICAL_GET_PARAMS}`,
        encodeParams: encodeTypicalParams,
        decodeParams: decodeTypicalParams,
    },
] as Route[];
