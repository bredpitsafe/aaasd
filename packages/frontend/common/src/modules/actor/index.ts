import type { ActorContext } from '../../actors/def.ts';
import type { TContextRef } from '../../di';

export type IModuleActor = ActorContext;

export const ModuleActor = (context: TContextRef): IModuleActor => {
    return context as unknown as ActorContext;
};
