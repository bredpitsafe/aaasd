import { isNil } from 'lodash-es';

import type { TVirtualAccount } from '../types/domain/account.ts';
import type { TAssetId, TAssetName } from '../types/domain/asset';
import type {
    TAssetEntityId,
    TAssetFingerprint,
    TVirtualAccountEntityId,
    TVirtualAccountFingerprint,
} from '../types/domain/entityIds';
import { logger as baseLogger } from './Tracing';
import { Binding } from './Tracing/Children/Binding.ts';

export function entityAssetIdToAssetId(assetEntityId: TAssetEntityId): TAssetId | undefined {
    return parseEntityId<TAssetEntityId, TAssetId, TAssetName, TAssetFingerprint>(
        assetEntityId,
        'a',
    )?.id;
}

export function entityVirtualAccountIdToAccountName(
    accountEntityId: TVirtualAccountEntityId,
): TVirtualAccount['name'] | undefined {
    return parseEntityId<TVirtualAccountEntityId, TAssetId, TAssetName, TVirtualAccountFingerprint>(
        accountEntityId,
        'V',
    )?.name;
}

// More description - https://bhft-company.atlassian.net/wiki/spaces/PLAT/pages/12648581/Configured+Id
function parseEntityId<
    TEntityId extends string,
    TId extends number,
    TName extends string,
    TEntityFingerprint extends string,
>(entityId: TEntityId, fingerprint: TEntityFingerprint): { id: TId; name: TName } | undefined {
    const logger = baseLogger.child(new Binding(`EntityIdsParser`));
    const match = entityId.match(/^([^:]+):(\d+):(.+)/);

    if (isNil(match)) {
        logger.error(`Entity "${entityId}" can't be parsed`);
        return undefined;
    }

    if (fingerprint !== match[1]) {
        logger.warn(
            `Entity "${entityId}" should have "${fingerprint}" fingerprint, but has "${match[1]}"`,
        );
    }

    const id = parseInt(match[2], 10) as TId;
    const name = match[3] as TName;
    return { id, name };
}
