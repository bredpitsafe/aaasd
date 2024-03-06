import { mapGet } from '../map';
import { logger } from '../Tracing';

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
    createKey: (args: A) => K;
    createValue: (key: K, args: A) => V;
    onBorrow?: (key: K, value: V, bank: IBank<K, A, V>) => void;
    onRelease?: (key: K, value: V, bank: IBank<K, A, V>) => void;
    onRemove?: (key: K, value: V, bank: IBank<K, A, V>) => void;

    verbose?: string;
};

export function createBank<K, A, V>(props: TBankProps<K, A, V>): IBank<K, A, V> {
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

    return methods;

    function log(msg: string) {
        props.verbose && logger.debug(`[Bank(${props.verbose})] ${msg}`);
    }

    function borrow(args: A) {
        const key = props.createKey(args);
        const cell = mapGet(bank, key, () => {
            log(`Create entity, key: ${key}`);
            return {
                count: 0,
                value: props.createValue(key, args),
            };
        });

        cell.count++;
        props.onBorrow?.(key, cell.value, methods);
        log(`Add borrower, key: ${key}, count: ${cell.count}`);

        return { key, value: cell.value };
    }

    function release(key: K) {
        const cell = bank.get(key);

        if (cell && cell.count > 0) {
            cell.count--;
            props.onRelease?.(key, cell.value, methods);
            log(`Release borrower, key: ${key}, count ${cell.count}`);
        }
    }

    function remove(key: K) {
        const cell = bank.get(key);

        if (cell !== undefined) {
            props.onRemove?.(key, cell.value, methods);
            bank.delete(key);
            log(`Remove entity, key: ${key}`);
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
        log(`Destroy`);
    }
}
