import type { EApplicationName } from '@common/types';
import { isNil } from 'lodash-es';

import { useFunction } from '../../../utils/React/useFunction';
import { useSingleSettings } from './useSingleSettings';

export function useBooleanSettings(
    appName: EApplicationName,
    key: string,
    defaultValue = false,
): [boolean, (value?: boolean) => void, VoidFunction, boolean] {
    const [value, onChange, onDelete, loading] = useSingleSettings<boolean>(
        appName,
        key,
        defaultValue,
    );

    const cbToggle = useFunction((newValue?: boolean) =>
        onChange(isNil(newValue) ? !value : newValue),
    );

    return [value, cbToggle, onDelete, loading];
}
