const getIndex = (_: unknown, i: number) => i;

export const getIncreasedInt32Array = (l: number) => {
    return new Int32Array(l).map(getIndex);
};

export const getIncreasedFloat32Array = (l: number) => {
    return new Float32Array(l).map(getIndex);
};

export const getIncreasedArray = (l: number) => {
    return Array.from(getIncreasedFloat32Array(l));
};
