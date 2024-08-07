import { useMemo } from 'react';

import { useSockets } from '../components/Settings/hooks/useSockets';
import type { TStage } from '../components/StageSelect/StageSelect';
import type { TSocketName } from '../types/domain/sockets';
import { ESocketType } from '../types/domain/sockets';
import { getProductionSocketsList } from '../utils/url';
import { useAppName } from './useAppName.ts';
import { useFavoriteStages } from './useFavoriteStages';

export function useStages() {
    const appName = useAppName();
    const [favoriteStates, , loading] = useFavoriteStages(appName);
    const [activeName, allStages] = useSockets();
    const prodStages = useMemo(() => getProductionSocketsList(), []);
    const rarelyUsedStageNames = useMemo(
        () => allStages?.filter((s) => !favoriteStates.has(s)),
        [allStages, favoriteStates],
    );
    return useMemo(
        () => ({
            active: activeName ? buildStage(activeName, prodStages) : undefined,
            favorite: Array.from(favoriteStates, (name) => buildStage(name, prodStages)),
            rarelyUsed: rarelyUsedStageNames
                ?.map((name) => buildStage(name, prodStages))
                .sort((a, b) => (a.name > b.name ? 1 : -1)),
            loading,
        }),
        [favoriteStates, rarelyUsedStageNames, prodStages, activeName, loading],
    );
}

export function buildStage(name: TSocketName, prodStages: TSocketName[]): TStage {
    return {
        name,
        tag: prodStages.includes(name) ? ESocketType.Production : ESocketType.Development,
    };
}
