import { isNil } from 'lodash-es';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TBacktestingRun } from '../../../types/domain/backtestings.ts';
import type { TRobotId } from '../../../types/domain/robots.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor, scanValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { shallowHash } from '../../../utils/shallowHash.ts';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '../../../utils/ValueDescriptor/utils.ts';
import type { TRequestStreamOptions, TRobotDashboard, TSubscribed } from '../def.ts';
import { filterOutSubscribedValueDescriptor } from '../utils.ts';

type TSendBody = TRequestStreamOptions & {
    robotIds: TRobotId[];
    btRunNo?: TBacktestingRun['btRunNo'];
};

type TReceiveBody =
    | TSubscribed
    | {
          type: 'RobotDashboardList';
          dashboards?: TServerRobotDashboard[];
      };

type TServerRobotDashboard = Omit<TRobotDashboard, 'id'>;

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToRobotDashboardList,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToRobotDashboardsUpdates = createRemoteProcedureCall(descriptor)({
    getPipe: (params) => {
        return pipe(
            filterOutSubscribedValueDescriptor(),
            mapValueDescriptor(({ value }) => {
                const mapped = value.payload.dashboards?.map((dashboard) => ({
                    ...dashboard,
                    id: shallowHash(dashboard.robotId, dashboard.name),
                    backtestingId: params.btRunNo,
                }));

                return createSyncedValueDescriptor(mapped);
            }),
            scanValueDescriptor(
                (
                    acc: undefined | TValueDescriptor2<UnifierWithCompositeHash<TRobotDashboard>>,
                    { value: dashboards },
                ) => {
                    const unifier =
                        acc?.value ?? new UnifierWithCompositeHash<TRobotDashboard>('id');

                    return createSyncedValueDescriptor(
                        isNil(dashboards) ? unifier : unifier.modify(dashboards),
                    );
                },
            ),
            map((vd) =>
                isSyncedValueDescriptor(vd) ? createSyncedValueDescriptor(vd.value.toArray()) : vd,
            ),
        );
    },
});
