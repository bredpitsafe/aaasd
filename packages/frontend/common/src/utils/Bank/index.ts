import { mapGet } from '@common/utils';
import type { Logger } from 'pino';

export type TBankCell<T> = {
    count: number;
    value: T;
};

export interface IBank<K, A, V> {
    borrow(args: A): { key: K; value: V };
    release(key: K): void;
    remove(key: K): void;
    removeIfDerelict(key: K): void;
    removeAllDerelict(): void;
    getAllValues(): V[];
    getAllCells(): TBankCell<V>[];
    destroy(): void;
}

export type TBankProps<K, A, V> = {
    logger?: Logger;
    createKey: (args: A) => K;
    createValue: (key: K, args: A) => V;
    onBorrow?: (key: K, value: V, bank: IBank<K, A, V>) => void;
    onRelease?: (key: K, value: V, bank: IBank<K, A, V>) => void;
    onRemove?: (key: K, value: V, bank: IBank<K, A, V>) => void;
};

export function createBank<K extends string, A, V>(props: TBankProps<K, A, V>): IBank<K, A, V> {
    const bank = new Map<K, TBankCell<V>>();
    const methods = {
        borrow,
        release,
        remove,
        removeIfDerelict,
        removeAllDerelict,
        getAllValues,
        getAllCells,
        destroy,
    };

    const bankLogger = props.logger;
    return methods;

    function borrow(args: A) {
        const key = props.createKey(args);
        const cell = mapGet(bank, key, () => {
            bankLogger?.trace('create entity', { key });
            return {
                count: 0,
                value: props.createValue(key, args),
            };
        });

        cell.count++;
        props.onBorrow?.(key, cell.value, methods);
        bankLogger?.trace('add borrower', { key, count: cell.count });

        return { key, value: cell.value };
    }

    function release(key: K) {
        const cell = bank.get(key);

        if (cell && cell.count > 0) {
            cell.count--;
            props.onRelease?.(key, cell.value, methods);
            bankLogger?.trace('release borrower', { key, count: cell.count });
        } else {
            bankLogger?.warn('failed to release cell', { key });
        }
    }

    function remove(key: K) {
        const cell = bank.get(key);

        if (cell !== undefined) {
            props.onRemove?.(key, cell.value, methods);
            bank.delete(key);
            bankLogger?.trace('remove entity', { key, count: cell.count });
        } else {
            bankLogger?.warn('failed to remove entity', { key });
        }
    }

    function removeIfDerelict(key: K) {
        const cell = bank.get(key);

        if (cell !== undefined && cell.count <= 0) {
            remove(key);
        }
    }

    function removeAllDerelict() {
        for (const key of bank.keys()) {
            removeIfDerelict(key);
        }
    }

    function getAllCells(): TBankCell<V>[] {
        return [...bank.values()];
    }

    function getAllValues(): V[] {
        return getAllCells().map((c) => c.value);
    }

    function destroy() {
        bank.clear();
        bankLogger?.trace('destroy');
    }
}
