import type {
    TRemoveUserSettingsRequestPayload,
    TRemoveUserSettingsResponsePayload,
} from '@backend/bff/src/modules/userSettings/schemas/RemoveUserSettings.schema';
import {
    createRemoteProcedureDescriptor,
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@common/rpc';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';

const descriptor = createRemoteProcedureDescriptor<
    TRemoveUserSettingsRequestPayload,
    TRemoveUserSettingsResponsePayload
>()(EPlatformSocketRemoteProcedureName.RemoveUserSettings, ERemoteProcedureType.Update);

export const ModuleRemoveUserSettings = createRemoteProcedureCall(descriptor)();
