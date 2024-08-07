import type { Renderer } from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import type { BBox } from 'rbush';
import RBush from 'rbush';
import type { Subscription } from 'rxjs';
import { share, Subject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

import type { TPart } from '../../../lib/Parts/def';
import type { IContext } from '../../types';
import { PixiComponent } from '../../utils/Pixi/PixiComponent';
import { getTextMeasure } from '../../utils/textMeasures';
import type { TChartPartsProps } from './index';

const MARGIN = 4;
const TEXT_HEIGHT = 12;

export class ChartPartsDebug extends PixiComponent(Container) {
    constructor(public props: TChartPartsProps) {
        super();
        this.updateProps(props);
    }

    updateProps(props: TChartPartsProps) {
        super.updateProps(props);

        this.removeChildren();

        for (const part of props.parts) {
            this.addChild(
                new ChartPartDebug({
                    ctx: props.ctx,
                    part,
                }),
            );
        }
    }
}

class ChartPartDebug extends PixiComponent(Container) {
    private text: Text;
    private fontSize = 12;
    private graphics = new Graphics();

    private sub?: Subscription;

    constructor(public props: { ctx: IContext; part: TPart }) {
        super();

        this.text = new Text(this.props.part.id, {
            fontSize: this.fontSize,
        });

        this.addChild(this.text);
        this.addChild(this.graphics);
    }

    onMount(): void {
        this.sub = onUpdatePositions$.subscribe(() => this.setTextPosition());
        triggerUpdatePositions();
    }

    onUnmount(): void {
        this.sub?.unsubscribe();
        triggerUpdatePositions();
    }

    setTextPosition(): void {
        const {
            props: {
                part: { interval },
                ctx: { viewport },
            },
        } = this;

        const x1 = interval[0] * viewport.scale.x;
        const x2 = x1 + getTextMeasure(this.text.text).width;

        this.text.y = MARGIN + getEmptyHeight(x1, x2);
    }

    render(renderer: Renderer): void {
        const {
            text,
            graphics,
            props: {
                part,
                ctx: { state, viewport },
            },
        } = this;
        const { interval } = part;
        const x = (interval[0] - state.clientTimeIncrement - viewport.getLeft()) * viewport.scale.x;

        // Lines
        graphics.clear();
        graphics.beginFill();
        graphics.drawRect(x, 0, 1, viewport.screenHeight);
        graphics.endFill();

        // text id
        text.x = x + MARGIN;

        super.render(renderer);
    }
}

const space = new RBush<BBox>();
const updatePositions$ = new Subject<void>();
const onUpdatePositions$ = updatePositions$.pipe(
    debounceTime(100),
    tap(() => space.clear()),
    share(),
);

const triggerUpdatePositions = () => updatePositions$.next();
const getEmptyHeight = (minX: number, maxX: number) => {
    let i = 0;

    while (true) {
        const collides = space.collides({
            minX,
            maxX,
            minY: i * TEXT_HEIGHT + 1,
            maxY: (i + 1) * TEXT_HEIGHT - 1,
        });

        if (!collides) break;

        i += 1;
    }

    space.insert({
        minX,
        maxX,
        minY: i * TEXT_HEIGHT,
        maxY: (i + 1) * TEXT_HEIGHT,
    });

    return i * TEXT_HEIGHT;
};
