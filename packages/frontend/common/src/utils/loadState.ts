import { EDataLoadState } from '../types/loadState';

export function isLoadingState(loadState: EDataLoadState): boolean {
    return [EDataLoadState.Idle, EDataLoadState.Loading].includes(loadState);
}
