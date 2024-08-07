import type { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';

import type { TScrollData } from '../../types/componentMetadata';
type IMarkerData = editor.IMarkerData;

export enum EConfigEditorMode {
    single = 'single',
    diff = 'diff',
}

export enum EConfigEditorLanguages {
    json = 'json',
    xml = 'xml',
}

export enum EConfigEditorSchema {
    dashboard = 'dashboard',
    panel = 'panel',
}

export type TEditorProps = {
    className?: string;

    language?: EConfigEditorLanguages;

    value: string;
    onChangeValue?: (value: string) => void;

    readOnly?: boolean;
    autoFocus?: boolean;
    resizable?: boolean;

    markers?: IMarkerData[];

    focusToLine?: number;
    getScrollPosition?: () => TScrollData | undefined;
    onSetScrollPosition?: (scroll?: TScrollData) => void;

    originalTitle?: string;
    modifiedTitle?: string;

    highlightLines?: {
        start: number;
        end?: number;
    };
    selection?: {
        startColumn: number;
        startLine: number;
        endColumn: number;
        endLine: number;
    };
    onChangeSelection?: (selection: TEditorProps['selection'] | null) => void;
};

export type TDiffEditorProps = Pick<
    TEditorProps,
    | 'className'
    | 'language'
    | 'onChangeValue'
    | 'autoFocus'
    | 'resizable'
    | 'readOnly'
    | 'focusToLine'
    | 'getScrollPosition'
    | 'onSetScrollPosition'
    | 'originalTitle'
    | 'modifiedTitle'
    | 'highlightLines'
    | 'selection'
    | 'onChangeSelection'
> & {
    originalValue: string;
    modifiedValue: string;

    originalMarkers?: IMarkerData[];
    modifiedMarkers?: IMarkerData[];
};
