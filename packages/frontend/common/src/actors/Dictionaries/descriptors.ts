import type { TAsset } from '../../types/domain/asset.ts';
import type { TInstrument } from '../../types/domain/instrument.ts';
import type { TWithSocketTarget } from '../../types/domain/sockets.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EActorRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';
import type { TInstrumentsDictionaryParams } from './actions/ModuleFetchInstruments.ts';

export const fetchAssetsProcedureDescriptors = createRemoteProcedureDescriptor<
    TWithSocketTarget,
    TAsset[]
>()(EActorRemoteProcedureName.FetchAssets, ERemoteProcedureType.Request);

export const fetchInstrumentsProcedureDescriptors = createRemoteProcedureDescriptor<
    TWithSocketTarget & TInstrumentsDictionaryParams,
    TInstrument[]
>()(EActorRemoteProcedureName.FetchInstruments, ERemoteProcedureType.Request);
