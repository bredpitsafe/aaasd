import type { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import type { TVirtualAccountId } from '../../../types/domain/account.ts';
import type { TAssetEntityId } from '../../../types/domain/entityIds.ts';
import type { TInstrumentId } from '../../../types/domain/instrument.ts';
import type { TRobotId } from '../../../types/domain/robots.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import type { ESide } from '../../../types/domain/task.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import { ModuleSocketPage } from '../../socketPage';
import { EComponentCommands } from '../def.ts';
import { ModuleExecRequestComponentCommand } from './ModuleExecComponentCommand.ts';

export type TFundingAmount = {
    amount: number;
    assetId?: TAssetEntityId;
};

export type TFunding = {
    balance?: {
        balance?: TFundingAmount;
        referenceBalance?: TFundingAmount;
    };
    position?: TFundingAmount;
};

export const ModuleGetComponentFundingOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const request = ModuleExecRequestComponentCommand(ctx);

        return (
            params: {
                robotId: TRobotId;
                instrumentId: TInstrumentId;
                virtualAccountId: string | TVirtualAccountId;
                side: ESide;
            },
            options,
        ): Observable<TValueDescriptor2<TFunding>> => {
            return currentSocketUrl$.pipe(
                filter((target): target is TSocketURL => target !== undefined),
                switchMap((target) =>
                    (
                        request(
                            {
                                target,
                                id: params.robotId,
                                command: EComponentCommands.GenericRobotCommand,
                                commandData: {
                                    getFunding: {
                                        side: params.side,
                                        instrumentId: params.instrumentId,
                                        virtualAccountId: params.virtualAccountId,
                                    },
                                },
                            },
                            options,
                        ) as Observable<TValueDescriptor2<{ fundingResponse: TFunding }>>
                    ).pipe(
                        mapValueDescriptor(({ value }) =>
                            createSyncedValueDescriptor(value.fundingResponse),
                        ),
                    ),
                ),
            );
        };
    },
);
