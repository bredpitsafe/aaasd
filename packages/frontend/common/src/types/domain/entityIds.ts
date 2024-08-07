import type { TVirtualAccount, TVirtualAccountId } from './account.ts';
import type { TAsset, TAssetId } from './asset';

export type TAssetFingerprint = 'a';
export type TVirtualAccountFingerprint = 'V';

type TEntityId<
    TFingerprint extends string,
    TId extends number,
    TName extends string,
> = `${TFingerprint}:${TId}:${TName}`;

export type TAssetEntityId = TEntityId<TAssetFingerprint, TAssetId, TAsset['name']>;
export type TVirtualAccountEntityId = TEntityId<
    TVirtualAccountFingerprint,
    TVirtualAccountId,
    TVirtualAccount['name']
>;
