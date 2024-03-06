import type { TStorageDashboardId } from '@frontend/common/src/types/domain/dashboardsStorage';

export class UpdateProgress {
    private readonly updatesSet: Set<TStorageDashboardId>;

    private constructor(updatesSet = new Set<TStorageDashboardId>()) {
        this.updatesSet = updatesSet;
    }

    static create(): UpdateProgress {
        return new UpdateProgress();
    }

    static add(updateProgress: UpdateProgress, storageId: TStorageDashboardId): UpdateProgress {
        const newSet = new Set<TStorageDashboardId>(updateProgress.updatesSet);
        newSet.add(storageId);

        return new UpdateProgress(newSet);
    }

    static remove(updateProgress: UpdateProgress, storageId: TStorageDashboardId): UpdateProgress {
        const newSet = new Set<TStorageDashboardId>(updateProgress.updatesSet);
        newSet.delete(storageId);

        return new UpdateProgress(newSet);
    }

    has(storageId: TStorageDashboardId): boolean {
        return this.updatesSet.has(storageId);
    }

    getAllUpdates(): TStorageDashboardId[] {
        return Array.from(this.updatesSet);
    }
}
