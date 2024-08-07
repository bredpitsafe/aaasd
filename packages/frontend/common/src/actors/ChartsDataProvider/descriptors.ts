import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { EActorRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs';
import type { TTaggedTimeseriesData } from './actions/ModuleFetchTaggedTimeseriesData';
import type {
    TGetChartPointsProps,
    TGetChartPointsReturnType,
} from './actions/ModuleGetChartPoints';
import type { TGetIndicatorTaggedData } from './actions/ModuleGetIndicatorTaggedData';

export const getChartPointsProcedureDescriptor = createRemoteProcedureDescriptor<
    TGetChartPointsProps,
    TGetChartPointsReturnType
>()(EActorRemoteProcedureName.GetChartPoints, ERemoteProcedureType.Request);

export const getChartPointCommentProcedureDescriptor = createRemoteProcedureDescriptor<
    TGetIndicatorTaggedData,
    TTaggedTimeseriesData[keyof TTaggedTimeseriesData]
>()(EActorRemoteProcedureName.GetChartTaggedMetadata, ERemoteProcedureType.Request);
