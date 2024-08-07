import type { Constructor } from '@common/types';
import { ArrowDiffer } from '@frontend/common/src/utils/ArrowDiffer';
import type { Container, DisplayObject } from 'pixi.js';

import type { IPixiComponent } from './PixiComponent';

type TKey = string | number;
type TRef<T extends DisplayObject = DisplayObject> = (inst: T) => void;
type TAttributes = {
    key?: TKey;
    ref?: TRef;
};
type TProps<Payload extends object = object> = TAttributes & Payload;

type TElement<
    Type extends Constructor = Constructor<IPixiComponent>,
    Props extends TProps = TProps,
> = {
    type: Type;
    props: Props;
};

type TPreparedElement = TElement & {
    props: TElement['props'] & { key: TKey };
    zIndex?: number;
};

export function createPixiElement<
    Type extends Constructor,
    Props extends ConstructorParameters<Type>[0] & TAttributes,
>(type: Type, props: Props): TElement<Type, Props> {
    return { type, props };
}

export class DeclarativeChildrenController<Host extends Container> {
    private mapKeyToChild = new Map<TKey, IPixiComponent>();
    private childrenDiffer = new ArrowDiffer(({ props }: TPreparedElement) => String(props.key));

    constructor(private host: Host) {}

    update<Element extends TElement>(elements: undefined | null | Element[]): void {
        const preparedElements = (elements || []).map(({ type, props }, index) => ({
            type,
            props: {
                ...props,
                key: createKey(type.name, props.key || index),
            },
            zIndex: index,
        }));
        const { host, mapKeyToChild, childrenDiffer } = this;
        const { added, updated, deleted } = childrenDiffer.nextState(preparedElements);

        added.forEach(({ props, type, zIndex }) => {
            const instance = new type(props);
            if (zIndex !== undefined) {
                instance.zIndex = zIndex;
            }
            host.addChild(instance);
            mapKeyToChild.set(props.key, instance);

            if (typeof props?.ref === 'function') {
                props.ref(instance);
            }
        });

        updated.forEach(({ props, zIndex }) => {
            const instance = mapKeyToChild.get(props.key);

            if (instance !== undefined) {
                instance.updateProps(props);
                if (zIndex !== undefined) {
                    instance.zIndex = zIndex;
                }
            }
        });

        deleted.forEach(({ props }) => {
            if (mapKeyToChild.has(props.key)) {
                host.removeChild(mapKeyToChild.get(props.key)!);
                mapKeyToChild.delete(props.key);
            }
        });

        if (added.length > 0 || updated.length > 0) {
            host.sortChildren();
        }
    }
}

function createKey(...args: Array<string | number>): string {
    return args.join('|');
}
