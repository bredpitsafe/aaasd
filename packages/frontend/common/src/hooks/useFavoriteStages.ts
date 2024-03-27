import { isUndefined } from 'lodash-es';
import { useMemo } from 'react';

import { TSettingsStoreName } from '../actors/Settings/db';
import { ECommonSettings } from '../components/Settings/def';
import { useSingleSettings } from '../components/Settings/hooks/useSingleSettings';
import { TSocketName } from '../types/domain/sockets';
import { useFunction } from '../utils/React/useFunction';

export function useFavoriteStages(
    project: TSettingsStoreName,
): [Set<TSocketName>, (socket: TSocketName, isFavorite: boolean) => void] {
    const [stages, setStages] = useSingleSettings<undefined | TSocketName[]>(
        project,
        ECommonSettings.FavoriteStages,
        undefined,
    );

    const current = useMemo(
        () => (isUndefined(stages) ? new Set<TSocketName>() : new Set(stages)),
        [stages],
    );

    return [
        current,
        useFunction((socket: TSocketName, isFavorite: boolean) => {
            if (isFavorite) {
                current.add(socket);
            } else {
                current.delete(socket);
            }
            setStages(Array.from(current));
        }),
    ];
}
