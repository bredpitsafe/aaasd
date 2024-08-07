type EPixiComponentEvents = import('./src/utils/Pixi/PixiComponent').EPixiComponentEvents;
type TViewportEvents = import('./src/components/ChartViewport/defs').TViewportEvents;

declare namespace GlobalMixins {
    declare type ComponentsEvents = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [K in EPixiComponentEvents]: K extends EPixiComponentEvents.updateProps ? [any] : [];
    };

    declare interface DisplayObjectEvents extends TViewportEvents, ComponentsEvents {}
}
