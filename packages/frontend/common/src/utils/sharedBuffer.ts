import TypedArray = NodeJS.TypedArray;

export function createSharedBuffer(bytes: number): SharedArrayBuffer {
    return new SharedArrayBuffer(bytes);
}

type TTypedArrayConstructor =
    | Uint8ArrayConstructor
    | Uint16ArrayConstructor
    | Uint32ArrayConstructor
    | Int8ArrayConstructor
    | Int16ArrayConstructor
    | Int32ArrayConstructor
    | Float32ArrayConstructor
    | Float64ArrayConstructor;

export interface ISharedNumber<T extends TypedArray> {
    (v?: number): number;
    arr: T;
}
export function createSharedNumber<T extends TypedArray>(
    seed: number,
    type: TTypedArrayConstructor = Float32Array,
    _view?: T,
): ISharedNumber<T> {
    const arr = _view || new type(new SharedArrayBuffer(type.BYTES_PER_ELEMENT));

    arr[0] = seed;
    fn.arr = arr;

    return fn as ISharedNumber<T>;

    function fn(): number {
        if (arguments.length === 0) {
            return arr[0] as number;
        } else {
            // eslint-disable-next-line prefer-rest-params
            return (arr[0] = arguments[0]);
        }
    }
}

export function restoreSharedNumber<T extends TypedArray>(arr: T): ISharedNumber<T> {
    return createSharedNumber(arr[0] as number, arr.constructor as TTypedArrayConstructor, arr);
}
