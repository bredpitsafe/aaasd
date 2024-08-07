import type { Observable } from 'rxjs';
import { first } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { ModuleFactory } from '../../../di';
import type { EComponentType, TComponentTypeToTypeId } from '../../../types/domain/component.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import type { TStructurallyCloneableObject } from '../../../types/serialization.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import { ModuleSocketPage } from '../../socketPage';
import type { EComponentCommands, TWithTraceId } from '../def.ts';
import { ModuleSetComponentUpdating } from '../ModuleSetComponentUpdating.ts';
import { ModuleExecUpdateComponentCommand } from './ModuleExecComponentCommand.ts';

export const ModuleUpdateComponentCommandOnCurrentStage = ModuleFactory((ctx) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const setComponentUpdating = ModuleSetComponentUpdating(ctx);
    const updateComponentCommand = ModuleExecUpdateComponentCommand(ctx);

    return function sendComponentCommandAction<
        Payload extends TStructurallyCloneableObject,
        Type extends EComponentType,
        IdType extends TComponentTypeToTypeId[Type] = TComponentTypeToTypeId[Type],
    >(
        {
            id,
            type,
            command,
            commandData,
        }: {
            id: IdType;
            type: Type;
            command: EComponentCommands;
            commandData?: TStructurallyCloneableObject;
        },
        options: TWithTraceId,
    ): Observable<TValueDescriptor2<Payload>> {
        const unsetComponentUpdating = setComponentUpdating(type, id);

        return currentSocketUrl$.pipe(
            first((target): target is TSocketURL => target !== undefined),
            switchMap((target) =>
                updateComponentCommand({ target, id, command, commandData }, options).pipe(
                    finalize(unsetComponentUpdating),
                ),
            ),
        ) as Observable<TValueDescriptor2<Payload>>;
    };
});
