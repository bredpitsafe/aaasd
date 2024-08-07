import hash_sum from 'hash-sum';
import { isNil } from 'lodash-es';

export class AgValue<P, D> {
    static create<Payload, Data extends object, Field extends keyof Data>(
        payload: Payload,
        data?: null | undefined | Data,
        fields?: Field[],
    ): null | AgValue<Payload, { [K in Field]: Data[K] }> {
        return isNil(data)
            ? null
            : new AgValue(
                  payload,
                  data,
                  hash_sum([payload, fields?.map((field) => data[field]) ?? data]),
              );
    }

    static isEqual<V extends AgValue<unknown, unknown>>(
        a: null | undefined | V,
        b: null | undefined | V,
    ): boolean {
        return a?.hash === b?.hash;
    }

    constructor(
        public payload: P,
        public data: D,
        public hash: string,
    ) {}

    valueOf(): null | P {
        return this.payload;
    }

    toString(): string {
        return isNil(this.payload) ? '' : String(this.payload);
    }
}
