import type { Nil } from '@common/types';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import { get, isNil } from 'lodash-es';

type TInstrumentValueParams = { data: undefined | TInstrument };
type PossibleType<T> = T extends { type: infer A } ? A : never;

export class ValueGetterBuilder<T> {
    constructor(private actions: ((v: Nil | object) => Nil | object)[] = []) {}

    addPath<Path extends keyof T>(path: Path): ValueGetterBuilder<T[Path]> {
        return new ValueGetterBuilder(
            this.actions.concat((value: Nil | object) => {
                return isNil(value) ? value : get(value, path);
            }),
        );
    }

    addCheckType<Type extends PossibleType<T>>(
        type: Type,
    ): ValueGetterBuilder<Extract<T, { type: Type }>> {
        return new ValueGetterBuilder(
            this.actions.concat((value: Nil | object) => {
                return isNil(value)
                    ? value
                    : 'type' in value && value.type === type
                      ? value
                      : undefined;
            }),
        );
    }

    build() {
        return (params: TInstrumentValueParams) => {
            return this.actions.reduce((data, action) => action(data), params.data as Nil | object);
        };
    }
}
