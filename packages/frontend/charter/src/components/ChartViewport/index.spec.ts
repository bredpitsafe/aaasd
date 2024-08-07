import type { Nanoseconds } from '@common/types';

import type { ICancellableViewportEvent } from './defs';
import { ViewportEvent } from './defs';
import { ChartViewport } from './index';

describe('Viewport', () => {
    it('World sizes are set', () => {
        const fn = jest.fn();

        const viewport = new ChartViewport({
            screenWidth: 300,
            screenHeight: 100,
        });

        viewport.on(ViewportEvent.ZoomH, fn);

        viewport.setWorldWidth(10000 as Nanoseconds);

        viewport.off(ViewportEvent.ZoomH, fn);

        expect(fn.mock.calls.length).toBe(1);
        expect(fn.mock.calls[0]).toEqual([{ type: 'worldWidth', viewport: viewport }]);

        expect(viewport.scale.x).toBe(0.03);
        expect(viewport.getLeft()).toBe(-4850);
    });

    describe('Viewport change dimensions', () => {
        let viewport: ChartViewport;

        beforeEach(() => {
            viewport = new ChartViewport({
                screenWidth: 300,
                screenHeight: 100,
            });
            viewport.setWorldWidth(10000 as Nanoseconds);
        });

        it('Should change left position', () => {
            viewport.moveLeft(1000);

            expect(viewport.getLeft()).toBe(1000);
            expect(viewport.getRight()).toBe(11000);
            expect(viewport.scale.x).toBe(0.03);
        });

        it('Should move center', () => {
            viewport.moveCenterX(7000);

            expect(viewport.getLeft()).toBe(2000);
            expect(viewport.getRight()).toBe(12000);
            expect(viewport.scale.x).toBe(0.03);
        });

        it('Should change left and right position', () => {
            viewport.setViewportLeftRight(300 as Nanoseconds, 700 as Nanoseconds);

            expect(viewport.getLeft()).toBe(300);
            expect(viewport.getRight()).toBe(700);
            expect(viewport.scale.x).toBe(0.75);
        });

        it('Should resize', () => {
            viewport.resize(100, 50);

            expect(viewport.getLeft()).toBe(-4850);
            expect(viewport.getRight()).toBe(-1516.6666666666665);
            expect(viewport.scale.x).toBe(0.03);
        });

        it('Should support scale X at start point', () => {
            viewport.moveLeft(100);
            viewport.setScaleX(10, { x: 100, y: 0 });

            expect(viewport.getLeft()).toBe(100);
            expect(viewport.getRight()).toBe(130);
            expect(viewport.scale.x).toBe(10);
        });

        it('Should support scale X at center point', () => {
            viewport.moveLeft(100);
            viewport.setScaleCenterX(10);

            expect(viewport.getLeft()).toBe(5085);
            expect(viewport.getRight()).toBe(5115);
            expect(viewport.scale.x).toBe(10);
        });

        it('Should support scale X at right point', () => {
            viewport.moveLeft(100);
            viewport.setScaleX(10, { x: 10100, y: 0 });

            expect(viewport.getLeft()).toBe(10070);
            expect(viewport.getRight()).toBe(10100);
            expect(viewport.scale.x).toBe(10);
        });

        it('Should not allow scale X if someone cancel measure event', () => {
            viewport.moveLeft(0);

            const fn = jest.fn((e: ICancellableViewportEvent) => e.preventDefault());

            viewport.on(ViewportEvent.TryZoomH, fn);

            viewport.setScaleCenterX(10);

            viewport.off(ViewportEvent.TryZoomH, fn);

            expect(fn.mock.calls.length).toBe(1);
            expect(fn.mock.calls[0]).toMatchObject([
                {
                    cancelled: true,
                    maxScaleX: null,
                    minScaleX: null,
                    scale: 10,
                    type: 'Horizontal',
                    viewport: viewport,
                    zoomPoint: { x: 5000, y: 50 },
                },
            ]);

            expect(viewport.getLeft()).toBe(-0);
            expect(viewport.getRight()).toBe(10000);
            expect(viewport.scale.x).toBe(0.03);
        });

        it('Should not allow scale Y if someone cancel measure event', () => {
            viewport.moveLeft(0);

            const fn = jest.fn((e: ICancellableViewportEvent) => e.preventDefault());

            viewport.on(ViewportEvent.TryZoomV, fn);

            viewport.setScaleCenterY(10);

            viewport.off(ViewportEvent.TryZoomV, fn);

            expect(fn.mock.calls.length).toBe(1);
            expect(fn.mock.calls[0]).toMatchObject([
                {
                    cancelled: true,
                    maxScaleY: null,
                    minScaleY: null,
                    scale: 10,
                    type: 'Vertical',
                    viewport: viewport,
                    zoomPoint: { x: 5000, y: 50 },
                },
            ]);

            expect(viewport.getLeft()).toBe(-0);
            expect(viewport.getRight()).toBe(10000);
            expect(viewport.scale.x).toBe(0.03);
        });
    });
});
