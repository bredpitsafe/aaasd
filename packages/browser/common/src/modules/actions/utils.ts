// HOT FIX. Backend don't want fix it on own side
import { TReceivedData } from '../../lib/BFFSocket/def';

export function tryFixSnapshotField<
    T extends {
        isSnapshot: boolean;
        is_snapshot?: boolean;
    },
>(envelope: TReceivedData<T>): TReceivedData<T> {
    try {
        const { payload } = envelope;

        if (payload.isSnapshot === undefined && payload.is_snapshot !== undefined) {
            payload.isSnapshot = payload.is_snapshot;
        }
    } catch (e) {}

    return envelope;
}
