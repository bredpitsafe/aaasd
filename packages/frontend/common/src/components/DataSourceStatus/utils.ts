import { EDataSourceLevel, EDataSourceStatus } from '../../modules/dataSourceStatus/defs';
import { blue, green, grey, red, yellow } from '../../utils/colors';

export const getColorByLevel = (level?: EDataSourceLevel): string => {
    switch (level) {
        case EDataSourceLevel.Error:
            return red[5];
        case EDataSourceLevel.Warning:
            return yellow[5];
        case EDataSourceLevel.Info:
            return blue[5];
        case EDataSourceLevel.Success:
            return green[5];
        default:
            return grey[5];
    }
};

export function socketStatusToLevel(socketStatus: EDataSourceStatus): undefined | EDataSourceLevel {
    switch (socketStatus) {
        case EDataSourceStatus.Disconnected:
            return EDataSourceLevel.Error;
        case EDataSourceStatus.Unstable:
            return EDataSourceLevel.Warning;
        case EDataSourceStatus.Stable:
            return EDataSourceLevel.Success;
        default:
            return undefined;
    }
}

export function socketStatusToMessage(socketStatus: EDataSourceStatus): string | undefined {
    switch (socketStatus) {
        case EDataSourceStatus.Unstable:
            return 'Connection is unstable';
        default:
            return undefined;
    }
}
