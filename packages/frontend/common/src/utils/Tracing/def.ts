import { Level } from 'pino';

import { TPublishLog } from '../../handlers/sendLogsEventHandle';
import { TStructurallyCloneable } from '../../types/serialization';

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
