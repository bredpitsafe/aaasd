import type {
    TStorageDashboardConfig,
    TStorageDashboardId,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { isNil, omit } from 'lodash-es';

export class UpdatesChecker {
    private spaces: Record<TStorageDashboardId, number[]> = {};

    openSpace(id: TStorageDashboardId) {
        this.spaces[id] = [];
    }

    closeSpace(id: TStorageDashboardId) {
        this.spaces = omit(this.spaces, id);
    }

    clearSpace(id: TStorageDashboardId) {
        if (isNil(this.spaces[id])) {
            return;
        }

        this.spaces[id] = [];
    }

    // TODO: additionally generate hash from dashboardItem.scopes, cuz this might be an issue in the future
    registerUpdate(id: TStorageDashboardId, config: string) {
        const space = this.spaces[id];

        if (!isNil(space)) {
            space.push(shallowHash(config));
        }
    }

    checkHasUpdateAndReset(id: TStorageDashboardId, config: TStorageDashboardConfig): boolean {
        const space = this.spaces[id];
        if (isNil(space)) {
            return false;
        }

        const hash = shallowHash(config);

        const hashIndex = space.indexOf(hash);

        if (hashIndex < 0) {
            return false;
        }

        space.splice(0, hashIndex + 1);

        if (space.length === 0) {
            // Leave latest in case we will receive it when another user saves config and we will need to update digest
            space.push(hash);
        }

        return true;
    }
}
