import { createBank } from '@frontend/common/src/utils/Bank';
import { logger } from '@frontend/common/src/utils/Tracing';
import { Binding } from '@frontend/common/src/utils/Tracing/Children/Binding.ts';
import { BitmapFont, TextStyle } from 'pixi.js';

import { chars, fontFamily, resolution } from '../font';

export type IFontController = ReturnType<typeof createFontController>;

const fontBank = createBank({
    logger: logger.child(new Binding('FontBank')),
    createKey: ({ color }: { color: number }) => `BitmapFont-${color}` as string,
    createValue: (key, { color }) => {
        const style = new TextStyle({
            fontFamily: fontFamily,
            fontSize: 12,
            fill: color,
        });

        return BitmapFont.from(key, style, {
            resolution,
            chars,
        });
    },
    onRelease(key, _, { removeIfDerelict }) {
        removeIfDerelict(key);
    },
    onRemove(key, font) {
        font.destroy();
    },
});

export function createFontController() {
    const borrowed = new Set<string>();
    const getFontName = (color: number) => {
        const { key } = fontBank.borrow({ color });
        borrowed.add(key);
        return key;
    };
    const destroy = () => {
        for (const key of borrowed) {
            fontBank.release(key);
        }
    };

    return {
        destroy,
        getFontName,
    };
}
