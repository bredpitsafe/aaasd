import type { TStructurallyCloneable } from '@common/types';
import type { Level } from 'pino';

import type { TPublishLog } from '../../modules/actions/logs/defs.ts';

export type TLoggerSettings = {
    fingerprint: string;
    sendLog: TSendLog;
};

export type TSendLog = (logs: TPublishLog) => void;

export type TLogEventData = {
    level: Level;
    fingerprint: string;
    message: string;
    timestamp: number;
    params: TStructurallyCloneable[];
    bindings?: TStructurallyCloneable[];
};
