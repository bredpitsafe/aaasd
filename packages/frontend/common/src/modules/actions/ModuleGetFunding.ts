import { Observable, of } from 'rxjs';
import { catchError, filter, map, startWith, switchMap } from 'rxjs/operators';

import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import { EComponentCommands } from '../../handlers/def';
import { requestComponentCommandHandle } from '../../handlers/sendComponentCommandHandle';
import type { TVirtualAccountId } from '../../types/domain/account';
import type { EComponentType } from '../../types/domain/component';
import type { TAssetEntityId } from '../../types/domain/entityIds';
import type { TInstrumentId } from '../../types/domain/instrument';
import type { TRobotId } from '../../types/domain/robots';
import type { TSocketURL } from '../../types/domain/sockets';
import type { ESide } from '../../types/domain/task';
import { Fail } from '../../types/Fail.ts';
import { EGrpcErrorCode } from '../../types/GrpcError.ts';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
    LOADING_VD,
} from '../../utils/ValueDescriptor/utils.ts';
import { ModuleCommunicationHandlers } from '../communicationHandlers';
import { ModuleSocketPage } from '../socketPage';

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

export const ModuleGetFunding = ModuleFactory((ctx: TContextRef) => {
    function getFunding(
        robotId: TRobotId,
        instrumentId: TInstrumentId,
        virtualAccountId: string | TVirtualAccountId,
        side: ESide,
    ): Observable<TValueDescriptor2<TFunding>> {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const { request } = ModuleCommunicationHandlers(ctx);

        return currentSocketUrl$.pipe(
            filter((url): url is TSocketURL => url !== undefined),
            switchMap((url) =>
                requestComponentCommandHandle<{ fundingResponse: TFunding }, EComponentType.robot>(
                    request,
                    url,
                    robotId,
                    EComponentCommands.GenericRobotCommand,
                    {
                        getFunding: {
                            instrumentId,
                            virtualAccountId,
                            side,
                        },
                    },
                ).pipe(
                    map((envelope) =>
                        createSyncedValueDescriptor(envelope.payload.fundingResponse),
                    ),
                    catchError((err) =>
                        of(
                            createUnsyncedValueDescriptor(
                                Fail(EGrpcErrorCode.UNKNOWN, {
                                    message: `Error loading Herodotus balances`,
                                    description: err.message,
                                    traceId: err.traceId,
                                }),
                            ),
                        ),
                    ),
                    startWith(LOADING_VD),
                ),
            ),
        );
    }

    return { getFunding };
});
