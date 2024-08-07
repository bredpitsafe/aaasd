import type { Opaque } from '@common/types';

import type { EComponentStatus, EComponentType } from './component';

export type TGateId = Opaque<'GateWayId', number>;
export type TGateType = EComponentType.mdGate | EComponentType.execGate;

export type TGate = {
    id: TGateId;
    type: TGateType;
    kind: string;
    name: string;
    status: EComponentStatus;
    statusMessage: null | string;
};
