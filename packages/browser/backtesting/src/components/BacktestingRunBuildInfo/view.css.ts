import { styleTab, styleVerticalFitTabs } from '@frontend/common/src/components/Tabs.css';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

export const cnTabs = style({
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
});

styleTab(cnTabs, {
    padding: '4px 8px',
});

styleVerticalFitTabs(cnTabs);

export const cnBuildInfo = style({
    padding: '4px 0',
    flexGrow: 0,
    flexShrink: 0,
});

export const cnTable = style({
    flexGrow: 1,
    flexShrink: 1,
});
