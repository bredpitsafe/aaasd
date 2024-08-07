import type {
    TUpsertUserSettingsRequestPayload,
    TUpsertUserSettingsResponsePayload,
} from '@backend/bff/src/modules/userSettings/schemas/UpsertUserSettings.schema';
import {
    createRemoteProcedureDescriptor,
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@common/rpc';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';

const descriptor = createRemoteProcedureDescriptor<
    TUpsertUserSettingsRequestPayload,
    TUpsertUserSettingsResponsePayload
>()(EPlatformSocketRemoteProcedureName.UpsertUserSettings, ERemoteProcedureType.Update);

export const ModuleUpsertUserSettings = createRemoteProcedureCall(descriptor)();
