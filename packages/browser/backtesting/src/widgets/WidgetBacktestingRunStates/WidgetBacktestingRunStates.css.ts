import {
    styleTab,
    styleTabPane,
    styleVerticalFitTabs,
} from '@frontend/common/src/components/Tabs.css';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnTabs = style({
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'hidden',
    minHeight: 0,
    minWidth: 0,
});

styleTab(cnTabs, {
    padding: '4px 8px',
});

styleTabPane(cnTabs, {
    flexShrink: 1,
    overflow: 'hidden',
    minHeight: 0,
    minWidth: 0,
});

styleVerticalFitTabs(cnTabs);

export const cnItem = style({
    flex: '1 1 100%',
});
