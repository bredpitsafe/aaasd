import type { ISO } from '@common/types';
import { isISO } from '@common/utils';
import type { TBase64 } from '@common/utils/src/base64.ts';
import { base64ToObject, objectToBase64 } from '@common/utils/src/base64.ts';
import { extractValidNumber } from '@common/utils/src/extract.ts';
import type { TEditorProps } from '@frontend/common/src/components/Editors/types';
import type { TEditorState } from '@frontend/common/src/modules/componentStateEditor';
import { EComponentStateEditorStateSource } from '@frontend/common/src/modules/componentStateEditor';
import {
    decodeTypicalParams,
    encodeTypicalParams,
} from '@frontend/common/src/modules/router/encoders';
import type { TServerId } from '@frontend/common/src/types/domain/servers';
import { isEmpty, isNil, isNumber, toNumber } from 'lodash-es';

import type { TRevisionList } from '../../types/instruments.ts';
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

        if (!isNil(params.instruments)) {
            parsedParams.instruments = decodeNumberArray(params.instruments);
        }

        if (!isNil(params.overrideInstruments)) {
            parsedParams.overrideInstruments = decodeNumberArray(params.overrideInstruments);
        }

        if (!isNil(params.instrumentsRevs)) {
            parsedParams.instrumentsRevs = decodeInstrumentsWithRevisions(params.instrumentsRevs);
        }

        if (!isNil(params.providerInstrumentsRevs)) {
            parsedParams.providerInstrumentsRevs = decodeInstrumentsWithRevisions(
                params.providerInstrumentsRevs,
            );
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

        if (!isNil(params.instruments)) {
            parsedParams.instruments = encodeNumberArray(params.instruments);
        }

        if (!isNil(params.overrideInstruments)) {
            parsedParams.overrideInstruments = encodeNumberArray(params.overrideInstruments);
        }

        if (!isNil(params.instrumentsRevs)) {
            parsedParams.instrumentsRevs = encodeInstrumentsWithRevisions(params.instrumentsRevs);
        }

        if (!isNil(params.providerInstrumentsRevs)) {
            parsedParams.providerInstrumentsRevs = encodeInstrumentsWithRevisions(
                params.providerInstrumentsRevs,
            );
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

function decodeNumberArray(s: string): number[] | undefined {
    const result = isEmpty(s?.trim())
        ? []
        : s
              .split(';')
              .map((n) => toNumber(n))
              .filter((n) => !Number.isNaN(n));
    return isEmpty(result) ? undefined : result;
}

function encodeNumberArray(arr: number[]): string | undefined {
    return isEmpty(arr) ? undefined : arr.join(';');
}

function decodeInstrumentsWithRevisions(
    data: string,
): undefined | ({ instrumentId: number; platformTime: TRevisionList } | number)[] {
    const result = isEmpty(data?.trim())
        ? []
        : data
              .split(';')
              .map((item) => {
                  const parts = item.split(',');

                  const instrumentId = toNumber(parts.shift());

                  if (
                      Number.isNaN(instrumentId) ||
                      (parts.length > 0 && parts.some((part) => !isEmpty(part) && !isISO(part)))
                  ) {
                      return undefined;
                  }

                  if (parts.length === 0) {
                      return instrumentId;
                  }

                  return {
                      instrumentId,
                      platformTime: parts.map((part) =>
                          isEmpty(part) ? undefined : (part as ISO),
                      ),
                  };
              })
              .filter(
                  (item): item is { instrumentId: number; platformTime: TRevisionList } | number =>
                      !isNil(item),
              );

    return isEmpty(result) ? undefined : result;
}

function encodeInstrumentsWithRevisions(
    arr: ({ instrumentId: number; platformTime: TRevisionList } | number)[],
): string | undefined {
    return isEmpty(arr)
        ? undefined
        : arr
              .map((item) => {
                  if (
                      isNumber(item) ||
                      item.platformTime.length === 0 ||
                      (item.platformTime.length === 1 && isEmpty(item.platformTime[0]))
                  ) {
                      return item;
                  }

                  return [item.instrumentId.toString()]
                      .concat(
                          item.platformTime.map((platformTime) =>
                              isNil(platformTime) ? '' : platformTime,
                          ),
                      )
                      .join(',');
              })
              .join(';');
}
