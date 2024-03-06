import { ActorContext } from 'webactor';

import { TContextRef } from '../../di';

export type IModuleActor = ActorContext;

export const ModuleActor = (context: TContextRef): IModuleActor => {
    return context as unknown as ActorContext;
};
