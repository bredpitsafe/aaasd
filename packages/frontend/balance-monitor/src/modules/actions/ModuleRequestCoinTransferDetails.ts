import type {
    TCoinId,
    TCoinTransferDetailsItem,
} from '@frontend/common/src/types/domain/balanceMonitor/defs.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

type TSendBody = {
    coin: TCoinId | undefined;
};

type TReceiveBody = {
    type: 'TransferDetails';
    details: Omit<TCoinTransferDetailsItem, 'rowId'>[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.RequestCoinTransferDetails,
    ERemoteProcedureType.Request,
);

export const ModuleRequestCoinTransferDetails = createRemoteProcedureCall(descriptor)({
    getPipe: () => mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload)),
});
