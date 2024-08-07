import { useEffect, useRef } from 'react';

export function useAggregate<T>(
    value: T | undefined,
    reduce: (previous: T | undefined, next: T | undefined) => T,
): T | undefined;
export function useAggregate<T>(
    value: T | undefined,
    reduce: (previous: T, next: T) => T,
    defaultValue: T,
): T;
export function useAggregate<T>(
    value: T | undefined,
    reduce: (previous: T | undefined, next: T | undefined) => T,
    defaultValue?: T,
): T | undefined {
    const valueRef = useRef<T>();

    useEffect(function () {
        valueRef.current = reduce(valueRef.current ?? defaultValue, value ?? defaultValue);
    });

    return valueRef.current ?? defaultValue;
}
