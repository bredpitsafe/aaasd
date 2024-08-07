import { isNil, pick } from 'lodash-es';
import type { IScrollEvent } from 'monaco-editor/esm/vs/editor/editor.api';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import type { ReactElement } from 'react';
import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useMount, useUnmount } from 'react-use';

import { EMPTY_ARRAY } from '../../utils/const';
import { EditorContainer } from './components/EditorContainer';
import { getEditorOptions } from './def';
import { useFocusToLine } from './hooks/useFocusToLine';
import { useHighlightLinesDecoration } from './hooks/useHighlightLinesDecoration';
import { useSelection } from './hooks/useSelection';
import type { TEditorProps } from './types';

export function Editor(props: TEditorProps): ReactElement {
    return (
        <EditorContainer className={props.className}>
            {({ container }) => <MonacoWrapper {...props} container={container} />}
        </EditorContainer>
    );
}

function MonacoWrapper(
    props: TEditorProps & {
        container: HTMLDivElement;
    },
) {
    const monaco = useMemo(() => {
        return editor.create(props.container, getEditorOptions(props));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useMount(() => {
        const newModel = editor.createModel(props.value, props.language);
        newModel.setEOL(0);

        monaco.setModel(newModel);

        if (props.autoFocus) {
            monaco.focus();
        }
    });

    useUnmount(() => {
        monaco.dispose();
    });

    useEffect(() => {
        const model = monaco.getModel();

        if (isNil(model)) {
            return;
        }

        const value = model.getValue();

        if (value !== props.value) {
            model.pushEditOperations(
                [],
                [
                    {
                        range: model.getFullModelRange(),
                        text: props.value,
                    },
                ],
                () => null,
            );
        }
    }, [monaco, props.value]);

    useEffect(() => {
        const model = monaco.getModel();

        if (isNil(model)) {
            return;
        }

        const lang = model.getLanguageId();

        if (lang !== props.language) {
            editor.setModelLanguage(model, props.language ?? 'plaintext');
        }
    }, [monaco, props.language]);

    useEffect(() => {
        monaco.updateOptions({ readOnly: props.readOnly });
    }, [monaco, props.readOnly]);

    useEffect(() => {
        const model = monaco.getModel();

        if (isNil(model)) {
            return;
        }

        editor.setModelMarkers(model, 'owner', props.markers || EMPTY_ARRAY);
    }, [monaco, props.markers]);

    useEffect(() => {
        const disposable =
            props.onChangeValue &&
            monaco.onDidChangeModelContent(() => {
                props.onChangeValue!(monaco.getValue());
            });

        return () => disposable?.dispose();
    }, [monaco, props.onChangeValue]);

    useFocusToLine(monaco, props.focusToLine);

    useEffect(() => {
        if (isNil(props.getScrollPosition)) {
            return;
        }

        const scrollPosition = props.getScrollPosition!();

        if (!isNil(scrollPosition)) {
            monaco.setScrollPosition(scrollPosition);
        }
    }, [monaco, props.getScrollPosition]);

    useSelection(monaco, props.selection, props.onChangeSelection);

    useHighlightLinesDecoration(monaco, props.highlightLines);

    // useLayoutEffect because we need to clear monaco event subscriptions before they
    // can receive events on new updated render
    useLayoutEffect(() => {
        if (isNil(props.onSetScrollPosition)) {
            return;
        }

        const didScrollChangeDisposable = monaco.onDidScrollChange((event: IScrollEvent) => {
            if (event.scrollTopChanged) {
                props.onSetScrollPosition!(pick(event, 'scrollTop'));
            }
        });

        return () => didScrollChangeDisposable?.dispose();
    }, [monaco, props.onSetScrollPosition]);

    return null;
}
