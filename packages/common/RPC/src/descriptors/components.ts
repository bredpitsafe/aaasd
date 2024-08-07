import { createRemoteProcedureDescriptor } from '../createRemoteProcedureDescriptor.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../defs.ts';

type TSendBody = {
    componentId: number;
    newStateRaw: string;
    currentDigest?: string;
};

export type TResultBody = {
    type: 'ComponentStateUpdated';
    componentId: number;
    digest: string;
};

export const updateComponentStateProcedureDescriptor = createRemoteProcedureDescriptor<
    TSendBody,
    TResultBody
>()(EPlatformSocketRemoteProcedureName.UpdateComponentState, ERemoteProcedureType.Update);
