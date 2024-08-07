import type { TPrimitive } from '@common/types';

export type TStructurallyCloneable =
    | Error
    | TPrimitive
    | TStructurallyCloneableArray
    | TStructurallyCloneableObject;

export type TStructurallyCloneableArray = TStructurallyCloneable[];
export type TStructurallyCloneableObject = { [key: string]: TStructurallyCloneable };

export interface IToStructurallyCloneable {
    toStructurallyCloneable(): TStructurallyCloneable;
}

export interface IFromStructurallyCloneable<T = {}, V = TStructurallyCloneable> {
    fromStructurallyCloneable(json: V): T;
}

export type TStructurallyCloneableError = Error;

export interface IToStructurallyCloneableError {
    toStructurallyCloneable(): TStructurallyCloneableError;
}

export interface IFromStructurallyCloneableError<T> {
    fromStructurallyCloneableError(error: TStructurallyCloneableError): T;
}

export interface IIsStructurallyCloneableError {
    isStructurallyCloneableError(v: unknown): v is TStructurallyCloneableError;
}

export interface IStructurallyCloneableErrorClass<T = Error>
    extends IFromStructurallyCloneableError<T>,
        IIsStructurallyCloneableError {}
