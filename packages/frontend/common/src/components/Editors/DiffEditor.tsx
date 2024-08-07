import { CaretDownOutlined, CaretUpOutlined, LockOutlined } from '@ant-design/icons';
import { isEmpty, isNil, pick } from 'lodash-es';
import type { IScrollEvent } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import type { ReactElement } from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMount, useUnmount } from 'react-use';

import type { TScrollData } from '../../types/componentMetadata';
import { EMPTY_ARRAY } from '../../utils/const';
import { useFunction } from '../../utils/React/useFunction';
import { Button } from '../Button';
import { Tag } from '../Tag';
import { EditorContainer } from './components/EditorContainer';
import { getEditorOptions } from './def';
import { useFocusToLine } from './hooks/useFocusToLine';
import { useHighlightLinesDecoration } from './hooks/useHighlightLinesDecoration';
import { useSelection } from './hooks/useSelection';
import type { EConfigEditorLanguages, TDiffEditorProps } from './types';

import ITextModel = editor.ITextModel;
import IMarkerData = editor.IMarkerData;
import EditorLayoutInfo = editor.EditorLayoutInfo;
import IStandaloneDiffEditor = editor.IStandaloneDiffEditor;
import {
    cnEllipsisOverflow,
    cnIcon,
    cnNavigationButton,
    cnNavigationContainer,
    cnSplitViewHeader,
    cnViewTitle,
} from './DiffEditor.css';

interface IContentLayout {
    contentLeft: number;
    contentWidth: number;
    width: number;
}

export function DiffEditor(props: TDiffEditorProps): ReactElement {
    return (
        <EditorContainer className={props.className}>
            {({ container, header }) => (
                <MonacoDiffWrapper {...props} container={container} header={header} />
            )}
        </EditorContainer>
    );
}

function MonacoDiffWrapper(
    props: TDiffEditorProps & {
        container: HTMLDivElement;
        header: HTMLDivElement;
    },
) {
    const monaco = useMemo(
        () => editor.createDiffEditor(props.container, getEditorOptions(props)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const navigationNext = useFunction(() => monaco.goToDiff('next'));
    const navigationPrevious = useFunction(() => monaco.goToDiff('previous'));

    useMount(() => {
        const originalModel = editor.createModel(props.originalValue, props.language);
        const modifiedModel = editor.createModel(props.modifiedValue, props.language);
        originalModel.setEOL(0);
        modifiedModel.setEOL(0);

        monaco.setModel({
            original: originalModel,
            modified: modifiedModel,
        });

        props.autoFocus && monaco.focus();
    });

    useUnmount(() => {
        monaco.dispose();
    });

    useEffect(() => {
        monaco.updateOptions({ readOnly: props.readOnly });
    }, [monaco, props.readOnly]);

    useValues(monaco, props.originalValue, props.modifiedValue);

    useLanguage(monaco, props.language);

    useMarkers(monaco, props.originalMarkers, props.modifiedMarkers);

    useChangeValue(monaco, props.onChangeValue);

    useScroll(monaco, props.getScrollPosition, props.onSetScrollPosition);

    useFocusToLine(monaco, props.focusToLine);

    useSelection(monaco.getModifiedEditor(), props.selection, props.onChangeSelection);

    useHighlightLinesDecoration(monaco.getModifiedEditor(), props.highlightLines);

    const layout = useLayoutChange(monaco);

    if (isNil(layout)) {
        return null;
    }

    const hasOriginalTitle = !isEmpty(props.originalTitle?.trim());
    const hasModifiedTitle = !isEmpty(props.modifiedTitle?.trim());

    return createPortal(
        <div className={cnSplitViewHeader}>
            <div
                className={cnViewTitle}
                style={{
                    flexBasis: layout.original.width,
                    paddingLeft: layout.original.contentLeft,
                }}
            >
                {hasOriginalTitle && (
                    <Tag className={cnEllipsisOverflow}>
                        <LockOutlined className={cnIcon} />
                        {props.originalTitle}
                    </Tag>
                )}
                <div className={cnNavigationContainer}>
                    <Button
                        className={cnNavigationButton}
                        size="small"
                        icon={<CaretUpOutlined />}
                        onClick={navigationPrevious}
                    />
                    <Button
                        className={cnNavigationButton}
                        size="small"
                        icon={<CaretDownOutlined />}
                        onClick={navigationNext}
                    />
                </div>
            </div>
            <div
                className={cnViewTitle}
                style={{
                    flexBasis: layout.modified.width,
                    paddingLeft: layout.modified.contentLeft,
                }}
            >
                {hasModifiedTitle && (
                    <Tag className={cnEllipsisOverflow}>{props.modifiedTitle}</Tag>
                )}
                <div className={cnNavigationContainer}>
                    <Button
                        className={cnNavigationButton}
                        size="small"
                        icon={<CaretUpOutlined />}
                        onClick={navigationPrevious}
                    />
                    <Button
                        className={cnNavigationButton}
                        size="small"
                        icon={<CaretDownOutlined />}
                        onClick={navigationNext}
                    />
                </div>
            </div>
        </div>,
        props.header,
    );
}

function setValue(model: ITextModel, nextValue: string) {
    const value = model.getValue();

    if (value !== nextValue) {
        model.pushEditOperations(
            [],
            [
                {
                    range: model.getFullModelRange(),
                    text: nextValue,
                },
            ],
            () => null,
        );
    }
}

function setMarkers(model: ITextModel, markers: IMarkerData[]) {
    editor.setModelMarkers(model, 'owner', markers);
}

function fromMonacoLayout(layout: EditorLayoutInfo): IContentLayout {
    return {
        contentLeft: layout.contentLeft,
        contentWidth: layout.contentWidth,
        width: layout.width,
    };
}

function useValues(
    monaco: IStandaloneDiffEditor,
    originalValue: string,
    modifiedValue: string,
): void {
    useEffect(() => {
        const model = monaco.getModel();

        if (model !== null && model.original !== null) {
            setValue(model.original, originalValue || '');
        }
    }, [monaco, originalValue]);

    useEffect(() => {
        const model = monaco.getModel();

        if (model !== null && model.modified !== null) {
            setValue(model.modified, modifiedValue || '');
        }
    }, [monaco, modifiedValue]);
}

function useLanguage(monaco: IStandaloneDiffEditor, language?: EConfigEditorLanguages): void {
    useEffect(() => {
        const model = monaco.getModel();

        if (model !== null) {
            editor.setModelLanguage(model.original, language ?? 'plaintext');
            editor.setModelLanguage(model.modified, language ?? 'plaintext');
        }
    }, [monaco, language]);
}

function useMarkers(
    monaco: IStandaloneDiffEditor,
    originalMarkers?: IMarkerData[],
    modifiedMarkers?: IMarkerData[],
): void {
    useEffect(() => {
        const model = monaco.getModel();

        if (model !== null) {
            setMarkers(model.original, originalMarkers || EMPTY_ARRAY);
        }
    }, [monaco, originalMarkers]);

    useEffect(() => {
        const model = monaco.getModel();

        if (model !== null) {
            setMarkers(model.modified, modifiedMarkers || EMPTY_ARRAY);
        }
    }, [monaco, modifiedMarkers]);
}

function useChangeValue(
    monaco: IStandaloneDiffEditor,
    onChangeValue?: (value: string) => void,
): void {
    useEffect(() => {
        const disposable =
            onChangeValue &&
            monaco.getModifiedEditor().onDidChangeModelContent(() => {
                onChangeValue!(monaco.getModifiedEditor().getModel()!.getValue());
            });

        return () => disposable?.dispose();
    }, [monaco, onChangeValue]);
}

function useScroll(
    monaco: IStandaloneDiffEditor,
    getScrollPosition?: () => TScrollData | undefined,
    onSetScrollPosition?: (scroll?: TScrollData) => void,
): void {
    useEffect(() => {
        if (isNil(getScrollPosition)) {
            return;
        }

        const scrollPosition = getScrollPosition();

        if (!isNil(scrollPosition)) {
            monaco.getModifiedEditor().setScrollPosition(scrollPosition);
        }
    }, [monaco, getScrollPosition]);

    // useLayoutEffect because we need to clear monaco event subscriptions before they
    // can receive events on new updated render
    useLayoutEffect(() => {
        if (isNil(onSetScrollPosition)) {
            return;
        }

        const didScrollChangeDisposable = monaco
            .getModifiedEditor()
            .onDidScrollChange((event: IScrollEvent) => {
                if (event.scrollTopChanged) {
                    onSetScrollPosition!(pick(event, 'scrollTop'));
                }
            });

        return () => didScrollChangeDisposable?.dispose();
    }, [monaco, onSetScrollPosition]);
}

function useLayoutChange(monaco: IStandaloneDiffEditor): {
    original: IContentLayout;
    modified: IContentLayout;
} | null {
    const originalLayoutRef = useRef<IContentLayout>();
    const modifiedLayoutRef = useRef<IContentLayout>();
    const [layout, setLayout] = useState<{
        original: IContentLayout;
        modified: IContentLayout;
    } | null>(null);

    useEffect(() => {
        const originalEditor = monaco.getOriginalEditor();
        const modifiedEditor = monaco.getModifiedEditor();

        originalLayoutRef.current = fromMonacoLayout(originalEditor.getLayoutInfo());
        modifiedLayoutRef.current = fromMonacoLayout(modifiedEditor.getLayoutInfo());

        setLayout({
            original: originalLayoutRef.current,
            modified: modifiedLayoutRef.current,
        });

        const disposableOriginal = originalEditor.onDidLayoutChange((layout) => {
            originalLayoutRef.current = fromMonacoLayout(layout);

            setLayout({
                original: originalLayoutRef.current,
                modified: modifiedLayoutRef.current!,
            });
        });

        const disposableModified = modifiedEditor.onDidLayoutChange((layout) => {
            modifiedLayoutRef.current = fromMonacoLayout(layout);

            setLayout({
                original: originalLayoutRef.current!,
                modified: modifiedLayoutRef.current,
            });
        });

        return () => {
            disposableOriginal.dispose();
            disposableModified.dispose();

            originalLayoutRef.current = undefined;
            modifiedLayoutRef.current = undefined;

            setLayout(null);
        };
    }, [monaco, setLayout]);

    return layout;
}
