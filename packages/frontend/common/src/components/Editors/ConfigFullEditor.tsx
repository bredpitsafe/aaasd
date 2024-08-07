import './style.css';

import type { SchemaObject } from 'ajv';
import cn from 'classnames';
import { isUndefined } from 'lodash-es';
import type { ReactElement } from 'react';
import { memo, useEffect, useMemo, useState } from 'react';

import {
    ConfigTabProps,
    EConfigTabSelectors,
} from '../../../e2e/selectors/trading-servers-manager/components/config-tab/config.tab.selectors';
import type { TScrollData } from '../../types/componentMetadata';
import type { TWithChildren } from '../../types/components';
import { useFunction } from '../../utils/React/useFunction';
import { createXMLCompletionProvider } from './completionProvider';
import {
    ApplyButton,
    ConfigActions,
    DiffSwitcher,
    DiscardButton,
} from './components/ConfigActions';
import { cnConfigEditor, cnEditor, cnWithChanges } from './ConfigFullEditor.css';
import { DiffEditor } from './DiffEditor';
import { Editor } from './Editor';
import type { TEditorProps } from './types';
import { EConfigEditorLanguages, EConfigEditorMode } from './types';
import { compareConfigs, getMarkersFromXML } from './utils';

export type TConfigFullEditorProps = Omit<TEditorProps, 'language'> &
    TWithChildren & {
        applyButtonClassName?: string;

        schema?: SchemaObject;
        modifiedValue?: string;

        language: EConfigEditorLanguages;

        viewMode?: EConfigEditorMode;
        onChangeViewMode?: (mode: EConfigEditorMode) => void;

        onApply?: (
            value: string,
            lang: EConfigEditorLanguages,
        ) => void | Promise<void> | Promise<boolean>;
        onDiscard?: () => void;
    };

export const ConfigFullEditor = memo((props: TConfigFullEditorProps): ReactElement => {
    const originalValue = useMemo(() => props.value ?? '', [props.value]);
    const [modifiedValue, setModifiedValue] = useState<string>(
        props.modifiedValue || originalValue,
    );

    const [viewMode, setViewMode] = useState<EConfigEditorMode>(
        props.viewMode ?? EConfigEditorMode.single,
    );
    // HACK: Without this, the external viewMode does not work
    useEffect(() => {
        if (!isUndefined(props.viewMode)) {
            setViewMode(props.viewMode);
        }
    }, [props.viewMode]);

    const [originalMarkers, setOriginalMarkers] = useState<TEditorProps['markers']>([]);

    const [modifiedMarkers, setModifiedMarkers] = useState<TEditorProps['markers']>([]);

    const [isProcessing, setIsProcessing] = useState(false);

    const [focusToLine, setFocusToLine] = useState<undefined | number>(undefined);

    const handleChangeValue = useFunction((modifiedValue: string): void => {
        setModifiedValue(modifiedValue);
        props.onChangeValue?.(modifiedValue);
    });

    const handleApply = useFunction(async () => {
        setIsProcessing(true);

        try {
            await props.onApply?.(modifiedValue, props.language);
        } finally {
            setIsProcessing(false);
        }
    });

    const handleDiscard = useFunction(async () => {
        setIsProcessing(true);

        try {
            await props.onDiscard?.();
            setModifiedValue(originalValue);
        } finally {
            setIsProcessing(false);
        }
    });

    const handleChangeViewMode = useFunction((mode: EConfigEditorMode): void => {
        setViewMode(mode);
        props.onChangeViewMode?.(mode);
    });

    const handleSetScrollPosition = useFunction((scroll?: TScrollData) => {
        setFocusToLine(undefined);
        props.onSetScrollPosition?.(scroll);
    });

    useEffect(() => {
        setModifiedValue(props.modifiedValue ?? originalValue);
    }, [originalValue, props.modifiedValue]);

    useEffect(() => {
        if (props.language === EConfigEditorLanguages.xml) {
            setModifiedMarkers(getMarkersFromXML(modifiedValue));
        }
    }, [props.language, modifiedValue]);

    useEffect(() => {
        if (
            props.language === EConfigEditorLanguages.xml &&
            props.viewMode === EConfigEditorMode.diff
        ) {
            setOriginalMarkers(getMarkersFromXML(originalValue));
        }
    }, [props.viewMode, props.language, originalValue]);

    useEffect(() => {
        setFocusToLine(props.focusToLine);
    }, [props.focusToLine]);

    useEffect(() => {
        if (props.language === EConfigEditorLanguages.xml && props.schema !== undefined) {
            return createXMLCompletionProvider(props.schema);
        }
    }, [props.language, props.schema]);

    const isDirty = !compareConfigs(originalValue, modifiedValue);

    const classNameEditor = cn(cnEditor, {
        [cnWithChanges]: isDirty,
    });

    return (
        <div
            {...ConfigTabProps[EConfigTabSelectors.ConfigForm]}
            className={cn(cnConfigEditor, props.className)}
        >
            {viewMode === EConfigEditorMode.single ? (
                <Editor
                    className={classNameEditor}
                    value={modifiedValue}
                    language={props.language}
                    readOnly={props.readOnly}
                    autoFocus={props.autoFocus}
                    markers={modifiedMarkers}
                    onChangeValue={handleChangeValue}
                    focusToLine={focusToLine}
                    highlightLines={props.highlightLines}
                    selection={props.selection}
                    getScrollPosition={props.getScrollPosition}
                    onSetScrollPosition={handleSetScrollPosition}
                    onChangeSelection={props.onChangeSelection}
                />
            ) : (
                <DiffEditor
                    className={classNameEditor}
                    language={props.language}
                    originalValue={originalValue}
                    modifiedValue={modifiedValue}
                    onChangeValue={handleChangeValue}
                    autoFocus={props.autoFocus}
                    readOnly={props.readOnly}
                    focusToLine={focusToLine}
                    originalMarkers={originalMarkers}
                    modifiedMarkers={modifiedMarkers}
                    getScrollPosition={props.getScrollPosition}
                    onSetScrollPosition={handleSetScrollPosition}
                    originalTitle={props.originalTitle}
                    modifiedTitle={props.modifiedTitle}
                    highlightLines={props.highlightLines}
                    selection={props.selection}
                    onChangeSelection={props.onChangeSelection}
                />
            )}
            <ConfigActions>
                {props.onApply && (
                    <ApplyButton
                        className={props.applyButtonClassName}
                        disabled={!isDirty || isProcessing}
                        loading={isProcessing}
                        onClick={handleApply}
                    />
                )}
                {props.onDiscard && (
                    <DiscardButton
                        disabled={!isDirty || isProcessing}
                        loading={isProcessing}
                        onClick={handleDiscard}
                    />
                )}
                {props.onChangeViewMode && (
                    <DiffSwitcher defaultValue={viewMode} onChange={handleChangeViewMode} />
                )}
                {props.children}
            </ConfigActions>
        </div>
    );
});
