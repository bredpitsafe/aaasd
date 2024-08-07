import { styleTabContent, styleTabPane } from '@frontend/common/src/components/Tabs.css';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    background: 'white',
    position: 'relative',
    height: '100%',
    padding: `4px`,
    minHeight: 0,
    border: '1px',
    borderColor: '#d9d9d9',
    borderRadius: '8px',
    boxShadow: '0 2px 0 rgb(0 0 0 / 2%)',
});
export const cnTabs = style({
    height: '100%',
});
styleTabContent(cnTabs, {
    height: '100%',
});
styleTabPane(cnTabs, {
    fontSize: '12px',
});

export const cnPanel = style({
    height: '100%',
});

export const cnContent = style({
    position: 'relative',
});

export const cnTabBar = style({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
});

export const cnTabBarExtra = style({
    display: 'flex',
    alignItems: 'center',
});

export const cnLabel = style({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    padding: '0 4px',
});
