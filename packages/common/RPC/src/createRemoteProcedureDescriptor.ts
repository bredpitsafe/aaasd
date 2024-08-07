import type { TStructurallyCloneable } from '@common/types';

import type {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
    TRemoteProcedureDescriptor,
} from './defs';

export function createRemoteProcedureDescriptor<
    Send extends TStructurallyCloneable,
    Receive extends TStructurallyCloneable,
>() {
    return function <Name extends EPlatformSocketRemoteProcedureName>(
        name: Name,
        type: ERemoteProcedureType,
    ): TRemoteProcedureDescriptor<Name, Send, Receive> {
        return {
            type,
            name,
        };
    };
}
