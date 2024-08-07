import type { ValueOf } from '@common/types';
import type { TEditorProps } from '@frontend/common/src/components/Editors/types';
import type { TEditorState } from '@frontend/common/src/modules/componentStateEditor';
import type {
    TEncodedTypicalRouteParams,
    TTypicalStageRouteParams,
} from '@frontend/common/src/modules/router/defs';
import { ETypicalRoute } from '@frontend/common/src/modules/router/defs';
import type { TGateId } from '@frontend/common/src/types/domain/gates';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TServerId } from '@frontend/common/src/types/domain/servers';

import type { TRevisionList } from '../../types/instruments.ts';

export const ETradingServersManagerRoutes = <const>{
    ...ETypicalRoute,
    Server: 'socket.server',
    Gate: 'socket.server.gate',
    Robot: 'socket.server.robot',
};
export enum ETradingServersManagerRouteParams {
    Server = 'server',
    Gate = 'gate',
    Robot = 'robot',
    ConfigSelection = 'configSelection',
    ConfigDigest = 'configDigest',
    StateEditor = 'stateEditor',
    InstrumentsList = 'instruments',
    OverrideInstrumentsList = 'overrideInstruments',
    RevisionInstrumentsList = 'instrumentsRevs',
    RevisionProviderInstrumentsList = 'providerInstrumentsRevs',
}
export type TTradingServersManagerRoute = `${ValueOf<typeof ETradingServersManagerRoutes>}`;

export type TTradingServersManagerRouteParams = TEncodedTypicalRouteParams & {
    [ETradingServersManagerRouteParams.Server]: string | undefined;
    [ETradingServersManagerRouteParams.Gate]: string | undefined;
    [ETradingServersManagerRouteParams.Robot]: string | undefined;
    [ETradingServersManagerRouteParams.ConfigSelection]: string | undefined;
    [ETradingServersManagerRouteParams.ConfigDigest]: string | undefined;
    [ETradingServersManagerRouteParams.StateEditor]: string | undefined;
    [ETradingServersManagerRouteParams.InstrumentsList]: string | undefined;
    [ETradingServersManagerRouteParams.OverrideInstrumentsList]: string | undefined;
    [ETradingServersManagerRouteParams.RevisionInstrumentsList]: string | undefined;
    [ETradingServersManagerRouteParams.RevisionProviderInstrumentsList]: string | undefined;
};

export type TRevisionInstrument = { instrumentId: number; platformTime: TRevisionList } | number;

export type TTradingServersManagerParams = TTypicalStageRouteParams & {
    [ETradingServersManagerRouteParams.Server]: TServerId | undefined;
    [ETradingServersManagerRouteParams.Gate]: TGateId | undefined;
    [ETradingServersManagerRouteParams.Robot]: TRobotId | undefined;
    [ETradingServersManagerRouteParams.ConfigSelection]: TEditorProps['selection'] | undefined;
    [ETradingServersManagerRouteParams.ConfigDigest]: string | undefined;
    [ETradingServersManagerRouteParams.StateEditor]: TEditorState | undefined;
    [ETradingServersManagerRouteParams.InstrumentsList]: number[] | undefined;
    [ETradingServersManagerRouteParams.OverrideInstrumentsList]: number[] | undefined;
    [ETradingServersManagerRouteParams.RevisionInstrumentsList]: TRevisionInstrument[] | undefined;
    [ETradingServersManagerRouteParams.RevisionProviderInstrumentsList]:
        | TRevisionInstrument[]
        | undefined;
};
