// @ts-ignore
import { isMacintosh } from 'monaco-editor/esm/vs/base/common/platform';
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';

type IStandaloneDiffEditorConstructionOptions = editor.IStandaloneDiffEditorConstructionOptions;

export const LEFT_EDITOR_BORDER_WIDTH = 4;

export function getEditorOptions(props: {
    readOnly?: boolean;
    resizable?: boolean;
}): IStandaloneDiffEditorConstructionOptions {
    return {
        readOnly: props.readOnly === undefined ? false : props.readOnly,
        automaticLayout: props.resizable === undefined ? true : props.resizable,
        fontSize: isMacintosh ? 11 : 13, // decrease default font size by 1px
        accessibilitySupport: 'on', // allows using Ctrl + Shift + left/right in the editor
        // Display sticky opening tags on the top of the editor
        stickyScroll: {
            enabled: true,
        },
    };
}
