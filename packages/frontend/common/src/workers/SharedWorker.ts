import { generateTraceId } from '../utils/traceId';

const KEY = 'SHARED_WORKER_SESSION_ID';

const updateSessionId = () => {
    localStorage.setItem(KEY, generateTraceId().toString());
};

const geSessionId = () => {
    return String(localStorage.getItem(KEY));
};

export class SharedWorker extends window.SharedWorker {
    static updateSessionId = updateSessionId;

    constructor(url: URL, options: { name: string; type: 'module' }) {
        url.searchParams.set('session', geSessionId());
        super(url, options);
    }
}
