import { TStructurallyCloneable } from '../../types/serialization';
import {
    EActorRemoteProcedureName,
    ERemoteProcedureType,
    EServerRemoteProcedureName,
} from './defs';
import { TRemoteProcedureDescriptor } from './types';

export function createRemoteProcedureDescriptor<
    Send extends TStructurallyCloneable,
    Receive extends TStructurallyCloneable,
>() {
    return function <Name extends EServerRemoteProcedureName | EActorRemoteProcedureName>(
        name: Name,
        type: ERemoteProcedureType,
    ): TRemoteProcedureDescriptor<Name, Send, Receive> {
        return {
            type,
            name,
        };
    };
}
