import type { Constructor } from '@common/types';
import type { Container, DisplayObject } from 'pixi.js';

export enum EPixiComponentEvents {
    updateProps = 'updateProps',
    mount = 'mount',
    unmount = 'unmount',
}

export type IPixiComponent<P = {}, B extends Container = Container> = B & {
    props: P;
    updateProps(props: P): void;
    onAdded(): void;
    onMount(): void;
    onRemoved(): void;
    onUnmount(): void;
};

const cacheContructors = new Map<unknown, unknown>();

export function PixiComponent<B extends Container, C extends Constructor<B>>(
    Base: C,
): C & Constructor<IPixiComponent> {
    if (!cacheContructors.has(Base)) {
        // @ts-ignore
        class Component extends Base {
            props: unknown;

            constructor(...args: unknown[]) {
                super(...args);

                this.on('added', this._onAdded, this);
                this.on('removed', this._onRemoved, this);
                this.on(EPixiComponentEvents.mount, this.onMount, this);
                this.on(EPixiComponentEvents.unmount, this.onUnmount, this);
            }

            updateProps(props: unknown): void {
                this.emit(EPixiComponentEvents.updateProps, props);
                Object.assign(this.props as object, props as object);
            }

            _onAdded() {
                this.onAdded();
                recursiveMount(this);
            }

            _onRemoved() {
                this.onRemoved();
                recursiveUnmount(this);
            }

            onAdded() {
                //
            }

            onRemoved() {
                //
            }

            onMount() {
                //
            }

            onUnmount() {
                //
            }
        }

        cacheContructors.set(Base, Component);
    }

    return cacheContructors.get(Base) as C & Constructor<IPixiComponent>;
}

function recursiveMount<T extends DisplayObject>(root: T): void {
    root.emit(EPixiComponentEvents.mount, undefined);
    'children' in root && root.children?.forEach((child) => recursiveMount(child as DisplayObject));
}

function recursiveUnmount<T extends DisplayObject>(root: T): void {
    root.emit(EPixiComponentEvents.unmount, undefined);
    'children' in root &&
        root.children?.forEach((child) => recursiveUnmount(child as DisplayObject));
}
