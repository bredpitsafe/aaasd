import { Container, DisplayObject, IRendererOptions, Renderer } from 'pixi.js';

import { fixMemoryLeak } from './fixMemoryLeak';

export type ISharedRenderer = ReturnType<typeof createSharedRenderer>;

export function createSharedRenderer(options?: Omit<IRendererOptions, 'view' | 'context'>) {
    const renderer = new Renderer(options);
    const mapStageToSize = new Map<
        Container,
        {
            width: number;
            height: number;
        }
    >();

    function destroy() {
        renderer.destroy(true);
        fixMemoryLeak(renderer);
    }

    function setStageSize(stage: Container, width: number, height: number) {
        mapStageToSize.set(stage, { width, height });
        resize();
    }

    function deleteStageSize(stage: Container) {
        mapStageToSize.delete(stage);
    }

    function resize() {
        let width = 0;
        let height = 0;

        for (const size of mapStageToSize.values()) {
            width = Math.max(width, size.width);
            height = Math.max(height, size.height);
        }

        if (renderer.view.width !== width || renderer.view.height !== height) {
            renderer.resize(width, height);
        }
    }

    function renderStage<T extends DisplayObject>(stage: T) {
        renderer.render(stage);
    }

    function transferImageToCanvas(target: CanvasRenderingContext2D) {
        target.drawImage(
            renderer.view as HTMLCanvasElement,
            0,
            0,
            target.canvas.width * devicePixelRatio,
            target.canvas.height * devicePixelRatio,
            0,
            0,
            target.canvas.width * devicePixelRatio,
            target.canvas.height * devicePixelRatio,
        );
    }

    return {
        setStageSize,
        deleteStageSize,
        renderer,
        destroy,
        renderStage,
        transferImageToCanvas,
    };
}
