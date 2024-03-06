export type TAssetId = number;
export type TAssetName = string;

export type TAsset = {
    id: TAssetId;
    kind: string;
    name: TAssetName;
};

export type TAssetRecord = Record<TAssetId, TAsset>;

export enum EAssetName {
    USD = 'USD',
}
