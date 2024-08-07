import type { Constructor } from '@common/types';
import { Container } from 'pixi.js';
import type { Observable } from 'rxjs';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { getState } from '../Charter/methods';
import type { IContext } from '../types';
import type { IPixiComponent } from '../utils/Pixi/PixiComponent';
import { EPixiComponentEvents } from '../utils/Pixi/PixiComponent';

enum EDebugMode {
    enabled,
    disabled,
}

export class DebugController {
    private mode$: BehaviorSubject<EDebugMode>;
    private stage: Container = new Container();

    constructor(public ctx: IContext) {
        this.mode$ = new BehaviorSubject<EDebugMode>(
            getState(ctx).enableDebug ? EDebugMode.enabled : EDebugMode.disabled,
        );
        this.mode$.subscribe((mode) =>
            mode === EDebugMode.enabled
                ? this.ctx.stage.addChild(this.stage)
                : this.ctx.stage.removeChild(this.stage),
        );
    }

    destroy(): void {
        this.mode$.complete();
    }

    isEnabled(): boolean {
        return this.mode$.getValue() === EDebugMode.enabled;
    }

    enable(): void {
        this.mode$.next(EDebugMode.enabled);
    }

    disable(): void {
        this.mode$.next(EDebugMode.disabled);
    }

    addDebugger<H extends IPixiComponent, C extends Constructor<IPixiComponent>>(
        host: H,
        Comp: C,
    ): void {
        new DebugComponentController({
            host,
            Comp,
            stage: this.stage,
            mode$: this.mode$,
        });
    }
}

class DebugComponentController<
    Host extends IPixiComponent,
    Comp extends Constructor<IPixiComponent>,
> {
    private component: undefined | IPixiComponent;
    private destroyer$ = new Subject<void>();

    constructor({
        host,
        Comp,
        stage,
        mode$,
    }: {
        host: Host;
        Comp: Comp;
        stage: Container;
        mode$: Observable<EDebugMode>;
    }) {
        mode$
            .pipe(
                map((mode) => mode === EDebugMode.enabled),
                distinctUntilChanged(),
                takeUntil(this.destroyer$),
            )
            .pipe(takeUntil(this.destroyer$))
            .subscribe((state) => {
                state ? this.mountComponent(stage, host, Comp) : this.unmountComponent(stage, host);
            });

        fromEvent(host, 'unmount')
            .pipe(takeUntil(this.destroyer$))
            .subscribe(() => {
                this.unmountComponent(stage, host);
                this.destroy();
            });
    }

    destroy(): void {
        this.destroyer$.next();
        this.destroyer$.complete();
    }

    private mountComponent(stage: Container, host: Host, Component: Comp): void {
        this.component = new Component(host.props);
        host.on(EPixiComponentEvents.updateProps, this.updateCompProps);
        stage.addChild(this.component);
    }

    private unmountComponent(stage: Container, host: Host): void {
        if (this.component) {
            stage.removeChild(this.component);
            host.off(EPixiComponentEvents.updateProps, this.updateCompProps);
            this.component = undefined;
        }
    }

    private updateCompProps = (props: InstanceType<Comp>['props']) => {
        this.component?.updateProps(props);
    };
}
