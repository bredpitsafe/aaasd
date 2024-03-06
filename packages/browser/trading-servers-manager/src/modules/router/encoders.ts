import type { TEditorProps } from '@frontend/common/src/components/Editors/types';
import {
    EComponentStateEditorStateSource,
    TEditorState,
} from '@frontend/common/src/modules/componentStateEditor';
import {
    decodeTypicalParams,
    encodeTypicalParams,
} from '@frontend/common/src/modules/router/encoders';
import type { TServerId } from '@frontend/common/src/types/domain/servers';
import { ISO } from '@frontend/common/src/types/time';
import type { TBase64 } from '@frontend/common/src/utils/base64';
import { base64ToObject, objectToBase64 } from '@frontend/common/src/utils/base64';
import { extractValidNumber } from '@frontend/common/src/utils/extract';
import { isNil } from 'lodash-es';

import type { TTradingServersManagerParams, TTradingServersManagerRouteParams } from './defs';

export function decodeParams(
    params: TTradingServersManagerRouteParams,
): TTradingServersManagerParams {
    try {
        const parsedParams = {
            ...(params as unknown as TTradingServersManagerParams),
            ...decodeTypicalParams(params),
        };

        if (!isNil(params.server)) {
            parsedParams.server = extractValidNumber(params.server) as TServerId;
        }

        if (!isNil(params.configSelection)) {
            try {
                parsedParams.configSelection = base64ToObject(
                    decodeURIComponent(params.configSelection) as TBase64<
                        TEditorProps['selection']
                    >,
                );
            } catch (e) {}
        }

        if (!isNil(params.configDigest)) {
            try {
                parsedParams.configDigest = decodeURIComponent(params.configDigest);
            } catch (e) {}
        }

        if (!isNil(params.stateEditor)) {
            parsedParams.stateEditor = decodeEditorState(params.stateEditor);
        }
        return parsedParams;
    } catch (e) {
        return params as unknown as TTradingServersManagerParams;
    }
}

export function encodeParams(
    params: TTradingServersManagerParams,
): TTradingServersManagerRouteParams {
    try {
        const parsedParams = {
            ...(params as unknown as TTradingServersManagerRouteParams),
            ...encodeTypicalParams(params),
        };

        if (!isNil(params.server)) {
            parsedParams.server = params.server.toString();
        }

        if (!isNil(params.configSelection)) {
            try {
                parsedParams.configSelection = encodeURIComponent(
                    objectToBase64(params.configSelection),
                );
            } catch (e) {}
        }

        if (!isNil(params.configDigest)) {
            try {
                parsedParams.configDigest = decodeURIComponent(params.configDigest);
            } catch (e) {}
        }

        if (!isNil(params.stateEditor)) {
            parsedParams.stateEditor = encodeEditorState(params.stateEditor);
        }

        return parsedParams;
    } catch (e) {
        return params as unknown as TTradingServersManagerRouteParams;
    }
}

function encodeEditorState(s: TEditorState): string {
    if (s.selection) {
        const { startLine, startColumn, endLine, endColumn } = s.selection;
        return `${s.revision},${startLine},${startColumn},${endLine},${endColumn}`;
    }

    return `${s.revision}`;
}

function decodeEditorState(s: string): TEditorState | undefined {
    const parts = s.split(',');

    if (parts.length === 1) {
        return { source: EComponentStateEditorStateSource.System, revision: parts[0] as ISO };
    } else if (parts.length >= 5) {
        const [revision, startLine, startColumn, endLine, endColumn] = parts;
        return {
            source: EComponentStateEditorStateSource.System,
            revision: revision as ISO,
            selection: {
                startLine: Number(startLine),
                startColumn: Number(startColumn),
                endLine: Number(endLine),
                endColumn: Number(endColumn),
            },
        };
    }

    return undefined;
}
