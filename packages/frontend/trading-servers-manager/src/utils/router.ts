import type { TBase64 } from '@common/utils/src/base64.ts';
import type { TFilterValue } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TGateId } from '@frontend/common/src/types/domain/gates';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TServerId } from '@frontend/common/src/types/domain/servers';
import { isEmpty, isNil } from 'lodash-es';

import type { TTradingServersManagerParams } from '../modules/router/defs';

export function getTradingServersManagerParams(
    params: TTradingServersManagerParams,
): TTradingServersManagerParams {
    return {
        socket: params.socket,
        server: params.server !== undefined ? (Number(params.server) as TServerId) : undefined,
        gate: params.gate !== undefined ? (Number(params.gate) as TGateId) : undefined,
        robot: params.robot !== undefined ? (Number(params.robot) as TRobotId) : undefined,
        filter: params.filter !== undefined ? (params.filter as TBase64<TFilterValue>) : undefined,
        tab: params.tab,
        createTab: !isNil(params.createTab),
        configDigest: params.configDigest,
        configSelection: params.configSelection,
        stateEditor: undefined,
        instruments: isEmpty(params.instruments) ? undefined : params.instruments,
        overrideInstruments: isEmpty(params.overrideInstruments)
            ? undefined
            : params.overrideInstruments,
        instrumentsRevs: isEmpty(params.instrumentsRevs) ? undefined : params.instrumentsRevs,
        providerInstrumentsRevs: isEmpty(params.providerInstrumentsRevs)
            ? undefined
            : params.providerInstrumentsRevs,
    };
}
