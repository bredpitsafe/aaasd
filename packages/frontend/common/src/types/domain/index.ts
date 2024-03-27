export type TIndexId = number;

export type TIndex = {
    id: TIndexId;
    kind: string;
    name: string;
};

export type TIndexRecord = Record<TIndexId, TIndex>;
