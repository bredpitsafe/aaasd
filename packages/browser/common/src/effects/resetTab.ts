import { EMPTY } from 'rxjs';

import { reloadAllTabsProcedureDescriptor } from '../actors/procedureDescriptors';
import { EContextTag, hasTag, TContextRef } from '../di';
import { ModuleRegisterActorRemoteProcedure } from '../utils/RPC/registerRemoteProcedure';

export function initResetTab(ctx: TContextRef): void {
    if (!hasTag(ctx, EContextTag.UI)) return;

    const register = ModuleRegisterActorRemoteProcedure(ctx);

    register(reloadAllTabsProcedureDescriptor, () => {
        window.location.reload();
        return EMPTY;
    });
}
