import type { EApplicationName } from '@common/types';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { ECommonSettings } from '../components/Settings/def';
import { useSingleSettings } from '../components/Settings/hooks/useSingleSettings';
import type { TSocketName } from '../types/domain/sockets';
import { useFunction } from '../utils/React/useFunction';

export function useFavoriteStages(
    appName: EApplicationName,
): [Set<TSocketName>, (socket: TSocketName, isFavorite: boolean) => void, boolean] {
    const [stages, setStages, , loading] = useSingleSettings<undefined | TSocketName[]>(
        appName,
        ECommonSettings.FavoriteStages,
        undefined,
    );

    const current = useMemo(
        () => (isNil(stages) ? new Set<TSocketName>() : new Set(stages)),
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
        loading,
    ];
}
