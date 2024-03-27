import { omit } from 'lodash-es';

import type { TSettingsStoreName } from '../../../actors/Settings/db';
import { EMPTY_OBJECT } from '../../../utils/const';
import { useFunction } from '../../../utils/React/useFunction';
import { useSingleSettings } from './useSingleSettings';

export function useMapSettings<T>(
    appName: TSettingsStoreName,
    key: string,
    mapKey: string | number,
    defaultValue: T,
): [T, (value: T) => void, VoidFunction, VoidFunction] {
    const [obj, onChangeObj, onDeleteObj] = useSingleSettings<Record<typeof mapKey, T>>(
        appName,
        key,
        EMPTY_OBJECT,
    );
    const value = obj[mapKey] ?? defaultValue;
    const cbChange = useFunction((value: T) => onChangeObj({ ...obj, [mapKey]: value }));
    const cbDelete = useFunction(() =>
        onChangeObj(omit(obj, mapKey) as Record<string | number, T>),
    );

    return [value, cbChange, cbDelete, onDeleteObj];
}
