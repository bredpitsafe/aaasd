import { styleTabContent } from '@frontend/common/src/components/Tabs.css';
import { grey } from '@frontend/common/src/utils/colors';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnTab = style({
    width: '100%',
    height: '100%',
    border: 'none',
});

styleTabContent(cnTab, { height: '100%' });

export const cnConfigTab = style({
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'hidden',
    minHeight: 0,
    minWidth: 0,
});

export const cnConfigEditor = style({
    flex: '1 1 100%',
});

export const cnStatusTabContent = style({
    height: '100%',
    overflow: 'auto',
});

export const cnStatusTabTimestamp = style({
    color: grey.primary,
});
