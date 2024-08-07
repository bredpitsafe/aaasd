import type { Key } from 'react';

import { useTabState } from '../../../hooks/useTabState';
import type { TConfigFullEditorProps } from '../ConfigFullEditor';

export function useTabEditorState(
    props: {
        key: Key;
    } & Partial<
        Pick<
            TConfigFullEditorProps,
            'modifiedValue' | 'onChangeValue' | 'viewMode' | 'onChangeViewMode'
        >
    >,
): Pick<TConfigFullEditorProps, 'modifiedValue' | 'viewMode'> & {
    changeValue: TConfigFullEditorProps['onChangeValue'];
    changeViewMode: TConfigFullEditorProps['onChangeViewMode'];
} {
    const [modifiedValue, changeValue] = useTabState(
        props.key + 'modifiedValue',
        props.modifiedValue,
        props.onChangeValue,
    );

    const [viewMode, changeViewMode] = useTabState(
        props.key + 'viewMode',
        props.viewMode,
        props.onChangeViewMode,
    );

    return {
        modifiedValue,
        changeValue,
        viewMode,
        changeViewMode,
    };
}
