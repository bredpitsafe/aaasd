import { isNil } from 'lodash-es';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { TRequestStreamOptions, TRobotDashboard, TSubscribed } from '../../handlers/def';
import { filterOutSubscribedValueDescriptor } from '../../handlers/utils';
import { TBacktestingRun } from '../../types/domain/backtestings';
import { TRobotId } from '../../types/domain/robots';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs';
import { mapValueDescriptor, scanValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import { shallowHash } from '../../utils/shallowHash';
import { UnifierWithCompositeHash } from '../../utils/unifierWithCompositeHash';
import { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '../../utils/ValueDescriptor/utils';

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
