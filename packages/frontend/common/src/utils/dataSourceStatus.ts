import type { TDataSourceState } from '../modules/dataSourceStatus/defs';
import { EDataSourceLevel } from '../modules/dataSourceStatus/defs';
import { orange, red } from './colors';

export function dataSourceLevelTypeToNumber(level?: EDataSourceLevel): number {
    switch (level) {
        case EDataSourceLevel.Error:
            return 10;
        case EDataSourceLevel.Warning:
            return 8;
        case EDataSourceLevel.Info:
            return 6;
        case EDataSourceLevel.Success:
            return 4;
        default:
            return 2;
    }
}

export function getWorstState(states: TDataSourceState[]): undefined | TDataSourceState {
    if (states.length === 0) return;
    if (states.length === 1) return states[0];

    let i = 0;
    let worst = states[i++];
    let status;

    while (worst.level !== EDataSourceLevel.Error && (status = states[i++])) {
        if (dataSourceLevelTypeToNumber(status.level) > dataSourceLevelTypeToNumber(worst.level)) {
            worst = status;
        }
    }

    return worst;
}

export function transformDataSourcesStatesToColor(states: TDataSourceState[]): string | undefined {
    const worst = getWorstState(states);

    if (worst === undefined) return;

    switch (worst.level) {
        case EDataSourceLevel.Warning:
            return orange[0];
        case EDataSourceLevel.Error:
            return red[0];
        default:
            return undefined;
    }
}
