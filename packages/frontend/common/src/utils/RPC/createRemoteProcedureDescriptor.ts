import { TStructurallyCloneable } from '../../types/serialization';
import {
    EActorRemoteProcedureName,
    EBffSocketRemoteProcedureName,
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from './defs';
import { TRemoteProcedureDescriptor } from './types';

export function createRemoteProcedureDescriptor<
    Send extends TStructurallyCloneable,
    Receive extends TStructurallyCloneable,
>() {
    return function <
        Name extends
            | EActorRemoteProcedureName
            | EPlatformSocketRemoteProcedureName
            | EBffSocketRemoteProcedureName,
    >(name: Name, type: ERemoteProcedureType): TRemoteProcedureDescriptor<Name, Send, Receive> {
        return {
            type,
            name,
        };
    };
}
