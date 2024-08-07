import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnTab = style({
    height: '100%',
});
export const cnTabsContainer = style({
    height: '100%',
});
export const cnTabPane = style(
    specify({
        height: '100%',
        overflowY: 'auto',
        paddingLeft: 0,
    }),
);
