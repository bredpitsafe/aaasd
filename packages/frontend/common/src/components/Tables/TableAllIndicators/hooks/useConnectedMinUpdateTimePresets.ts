import type { ISO } from '@common/types';
import { toISO } from '@common/utils';
import dayjs from 'dayjs';

import type { ETableIds } from '../../../../modules/clientTableFilters/data';
import { useSyncedTableFilter } from '../../../AgTable/hooks/useSyncedTableFilter';

export enum EMinUpdateTimePresets {
    Hour = '1h',
    SixHours = '6h',
    HalfDay = '12h',
    Day = '1D',
    Week = '1W',
    Month = '1M',
    Inf = 'Inf',
}

export type TUseMinUpdateTimePresetsReturnType = {
    minUpdateTimePreset?: EMinUpdateTimePresets;
    minUpdateTimePresets: EMinUpdateTimePresets[];
    onMinUpdateTimePresetChange: (preset?: EMinUpdateTimePresets) => void;
};

const minUpdateTimePresets = Object.values(EMinUpdateTimePresets);

export function useConnectedMinUpdateTimePresets(
    tableId: ETableIds,
): TUseMinUpdateTimePresetsReturnType {
    const [minUpdateTimePreset, onMinUpdateTimePresetChange] =
        useSyncedTableFilter<EMinUpdateTimePresets>(tableId, 'MinUpdateTime');

    return {
        minUpdateTimePreset: minUpdateTimePreset ?? EMinUpdateTimePresets.Inf,
        minUpdateTimePresets,
        onMinUpdateTimePresetChange: onMinUpdateTimePresetChange,
    };
}

export function timePreset2Iso(preset: EMinUpdateTimePresets): undefined | ISO {
    let date = dayjs();

    switch (preset) {
        case EMinUpdateTimePresets.Inf: {
            return undefined;
        }
        case EMinUpdateTimePresets.Hour: {
            date = date.subtract(1, 'hour');
            break;
        }
        case EMinUpdateTimePresets.SixHours: {
            date = date.subtract(6, 'hour');
            break;
        }
        case EMinUpdateTimePresets.HalfDay: {
            date = date.subtract(12, 'hour');
            break;
        }
        case EMinUpdateTimePresets.Day: {
            date = date.subtract(1, 'day');
            break;
        }
        case EMinUpdateTimePresets.Week: {
            date = date.subtract(1, 'week');
            break;
        }
        case EMinUpdateTimePresets.Month: {
            date = date.subtract(1, 'month');
            break;
        }
    }

    return toISO(date);
}
