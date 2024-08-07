import { XMLValidator } from 'fast-xml-parser';
import memoizee from 'memoizee';
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { MarkerSeverity } from 'monaco-editor/esm/vs/editor/editor.api.js';

import { EMPTY_ARRAY } from '../../utils/const';
import { isJSON, isXML } from '../../utils/dataFormat';
import { EConfigEditorLanguages } from './types';

type IMarkerData = editor.IMarkerData;

export function getLanguage(
    source = '',
    fallback = EConfigEditorLanguages.xml,
): EConfigEditorLanguages {
    return isJSON(source)
        ? EConfigEditorLanguages.json
        : isXML(source)
          ? EConfigEditorLanguages.xml
          : fallback;
}

export function getMarkersFromXML(xml: string): IMarkerData[] {
    try {
        const result = XMLValidator.validate(xml);
        const err = typeof result === 'object' ? result.err : undefined;

        return err
            ? [
                  {
                      startLineNumber: err.line,
                      startColumn: err.col,
                      endLineNumber: err.line,
                      endColumn: err.col + 100,
                      code: err.code,
                      message: err.msg,
                      severity: MarkerSeverity.Error,
                  },
              ]
            : EMPTY_ARRAY;
    } catch (e) {
        return [
            {
                startLineNumber: 0,
                startColumn: 0,
                endLineNumber: Infinity,
                endColumn: Infinity,
                message: `Could not parse XML`,
                severity: MarkerSeverity.Error,
            },
        ];
    }
}

export const compareConfigs = memoizee(
    (config1: string, config2: string): boolean => {
        return config1.replace(/\r\n/gm, '\n') === config2.replace(/\r\n/gm, '\n');
    },
    {
        max: 10,
        primitive: true,
    },
);
