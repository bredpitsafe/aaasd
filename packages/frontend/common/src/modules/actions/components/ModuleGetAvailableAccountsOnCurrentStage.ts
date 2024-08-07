import type { THerodotusAccount } from '@frontend/herodotus/src/types/domain.ts';
import { filter, switchMap } from 'rxjs/operators';

import type { TRobotId } from '../../../types/domain/robots.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import { ModuleSocketPage } from '../../socketPage';
import { EComponentCommands } from '../def.ts';
import { ModuleExecRequestComponentCommand } from './ModuleExecComponentCommand.ts';

type TPayload = {
    availableAccountsListed: THerodotusAccount[];
};

export const ModuleGetAvailableAccountsOnCurrentStage = createObservableProcedure((ctx) => {
    const request = ModuleExecRequestComponentCommand(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (robotId: TRobotId, options) => {
        return currentSocketUrl$.pipe(
            filter((target): target is TSocketURL => target !== undefined),
            switchMap((target) =>
                request(
                    {
                        target,
                        id: robotId,
                        command: EComponentCommands.GenericRobotCommand,
                        commandData: 'getAvailableAccountsList',
                    },
                    options,
                ).pipe(
                    mapValueDescriptor(({ value }) =>
                        createSyncedValueDescriptor((value as TPayload).availableAccountsListed),
                    ),
                ),
            ),
        );
    };
});
