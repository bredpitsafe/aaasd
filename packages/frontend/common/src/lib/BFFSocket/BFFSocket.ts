import type { Assign } from '@common/types';
import { generateTraceId, getNowISO } from '@common/utils';
import { isNumber, isString, isUndefined } from 'lodash-es';

import type { TSocketName } from '../../types/domain/sockets.ts';
import type { ISocketPlugin } from '../Socket/def';
import type { TWebSocketListenerDataMap } from '../Socket/Socket';
import { Socket } from '../Socket/Socket';
import type { TEnvelope, TReceivedEnvelope, TReceiveError, WithError, WithState } from './def';
import { EHeaderState } from './def';

type TCorrelationId = number;
type TPartialBody = string;

type TBFFSocketListenerDataMap = Assign<
    TWebSocketListenerDataMap,
    {
        partial: TPartialMeta;
        envelope: TReceivedEnvelope<unknown>;
    }
>;

const MAX_FRAME_SIZE = 65_536;
const PARTIAL_HEAD = 'PARTIAL';

export type TPartialMeta = { correlationId: TCorrelationId; sentSize: number; fullSize: number };

export class BFFSocket<
    DataMap extends TBFFSocketListenerDataMap = TBFFSocketListenerDataMap,
> extends Socket<DataMap> {
    public name: TSocketName;
    private corrIdToPartialMap: Map<TCorrelationId, TPartialBody> = new Map();

    constructor(
        name: TSocketName,
        url: string | URL,
        options?: {
            protocols?: string | string[];
            maxFrameSize?: number;
        },
        plugins: ISocketPlugin[] = [],
    ) {
        const maxFrameSize = options?.maxFrameSize ?? MAX_FRAME_SIZE;
        const urlInstance = url instanceof URL ? url : new URL(url);
        urlInstance.searchParams.set('max-message-part-size', String(maxFrameSize));

        super(urlInstance, options?.protocols, plugins);

        this.name = name;
    }

    protected emitWs<T extends keyof DataMap>(type: T, event: DataMap[T]): void {
        if (type === 'message') {
            const message = (event as MessageEvent).data;
            if (!isString(message)) throw new Error('BFF Websocket supports only string messages');
            if (message.startsWith(PARTIAL_HEAD)) return this.handlePartialMessages(message);
            return super.emitWs('envelope', parseMessage(message, getParseError));
        }

        super.emitWs(type, event);
    }

    private handlePartialMessages(str: string) {
        const partial = parsePartial(str);

        if (isUndefined(partial)) {
            return super.emitWs('envelope', getPartialParseError());
        }

        const {
            meta: { correlationId, sentSize, fullSize },
            body,
        } = partial;

        this.emitWs('partial', { correlationId, sentSize, fullSize });

        if (sentSize === fullSize) {
            const buffer = this.corrIdToPartialMap.get(correlationId) ?? '';
            const fullMessage = buffer + body;

            this.corrIdToPartialMap.delete(correlationId);

            super.emitWs(
                'envelope',
                parseMessage(fullMessage, getConcatenatedParseError.bind(null, correlationId)),
            );
        } else {
            const buffer = this.corrIdToPartialMap.get(correlationId);

            if (isString(buffer)) {
                this.corrIdToPartialMap.set(correlationId, buffer + body);
            } else {
                this.corrIdToPartialMap.set(correlationId, body);
            }
        }
    }
}

function parseMessage(
    message: string,
    createError: () => TReceivedEnvelope<unknown>,
): TReceivedEnvelope<unknown> {
    try {
        return JSON.parse(message);
    } catch (e) {
        return createError();
    }
}

export function parsePartial(str: string):
    | undefined
    | {
          meta: TPartialMeta;
          body: TPartialBody;
      } {
    const head = str.split('{')[0];
    const metaSize = Number(head.slice(PARTIAL_HEAD.length));

    if (Number.isNaN(metaSize)) return undefined;

    const meta = parseMeta(str.slice(head.length, head.length + metaSize));

    if (isUndefined(meta)) return undefined;

    const body = str.slice(head.length + metaSize);

    return {
        meta,
        body,
    };
}

function parseMeta(metaJson: string): undefined | TPartialMeta {
    let meta;
    try {
        meta = JSON.parse(metaJson);
    } catch (e) {
        return undefined;
    }

    if (!isNumber(meta.correlation_id) || !isNumber(meta.sent_size) || !isNumber(meta.full_size)) {
        return undefined;
    }

    return {
        correlationId: meta.correlation_id,
        sentSize: meta.sent_size,
        fullSize: meta.full_size,
    };
}

function getParseError() {
    return {
        error: {
            kind: 'INVALID_MESSAGE',
            description: 'Cannot parse message',
        },
        state: EHeaderState.Aborted,
        traceId: generateTraceId(),
        correlationId: 0,
        timestamp: getNowISO(),
    } satisfies WithState & TEnvelope<WithError<TReceiveError>>;
}

function getPartialParseError() {
    return {
        error: {
            kind: 'INVALID_PARTIAL_MESSAGE',
            description: 'Cannot parse partial message',
        },
        state: EHeaderState.Aborted,
        traceId: generateTraceId(),
        correlationId: 0,
        timestamp: getNowISO(),
    } satisfies WithState & TEnvelope<WithError<TReceiveError>>;
}
function getConcatenatedParseError(correlationId: TCorrelationId) {
    return {
        error: {
            kind: 'INVALID_CONCATENATED_MESSAGE',
            description: 'Cannot parse concatenated message',
        },
        state: EHeaderState.Aborted,
        traceId: generateTraceId(),
        correlationId,
        timestamp: getNowISO(),
    } satisfies WithState & TEnvelope<WithError<TReceiveError>>;
}
