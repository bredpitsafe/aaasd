import { CircularArray } from '../../CircularArray';

export function createInMemoryLogKeeper<T>(): {
    pushTrace: (log: T) => void;
    getLogs: () => T[];
} {
    const history = new CircularArray<T>(1_000);
    const pushTrace = (log: T) => {
        history.push(log);
    };
    const getLogs = () => {
        return history.toCompactArray();
    };

    return { getLogs, pushTrace };
}
