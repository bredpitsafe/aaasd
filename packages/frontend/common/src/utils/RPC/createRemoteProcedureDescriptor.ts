import type { TRemoteProcedureDescriptor } from '@common/rpc';
import type { TStructurallyCloneable } from '@common/types';

import type {
    EActorRemoteProcedureName,
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from './defs';

export function createRemoteProcedureDescriptor<
    Send extends TStructurallyCloneable,
    Receive extends TStructurallyCloneable,
>() {
    return function <Name extends EActorRemoteProcedureName | EPlatformSocketRemoteProcedureName>(
        name: Name,
        type: ERemoteProcedureType,
    ): TRemoteProcedureDescriptor<Name, Send, Receive> {
        return {
            type,
            name,
        };
    };
}
