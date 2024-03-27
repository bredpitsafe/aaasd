import { useMemo } from 'react';

import { TSettingsStoreName } from '../actors/Settings/db';
import { useSockets } from '../components/Settings/hooks/useSockets';
import { TStage } from '../components/StageSelect/StageSelect';
import { ESocketType, TSocketName } from '../types/domain/sockets';
import { getProductionSocketsList } from '../utils/url';
import { useFavoriteStages } from './useFavoriteStages';

export function useStages(settingsStoreName: TSettingsStoreName) {
    const [favoriteStates] = useFavoriteStages(settingsStoreName);
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
        }),
        [favoriteStates, rarelyUsedStageNames, prodStages, activeName],
    );
}

export function buildStage(name: TSocketName, prodStages: TSocketName[]): TStage {
    return {
        name,
        tag: prodStages.includes(name) ? ESocketType.Production : ESocketType.Development,
    };
}
