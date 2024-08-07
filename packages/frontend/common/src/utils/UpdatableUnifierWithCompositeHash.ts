import { UnifierWithCompositeHash } from './unifierWithCompositeHash';

enum EActionTypes {
    Delete = 'delete',
    Update = 'update',
}

export class UpdatableUnifierWithCompositeHash<T extends object, TKey extends keyof T> {
    private readonly cache = new UnifierWithCompositeHash<
        { id: T[TKey] | string } & (
            | { action: EActionTypes.Delete }
            | { action: EActionTypes.Update; item: T }
        )
    >('id', {
        removePredicate({ action }) {
            return action === 'delete';
        },
    });

    constructor(private key: TKey) {}

    upsert(item: T) {
        this.cache.modify([{ action: EActionTypes.Update, id: item[this.key], item }]);
    }

    remove(id: T[TKey]) {
        this.cache.modify([{ action: EActionTypes.Delete, id }]);
    }

    clear() {
        this.cache.clear();
    }

    getItems(): T[] {
        return this.cache
            .toArray()
            .filter(
                (item): item is { action: EActionTypes.Update; id: T[TKey]; item: T } =>
                    item.action === EActionTypes.Update,
            )
            .map(({ item }) => item);
    }
}
