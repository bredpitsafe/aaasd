import { style } from '@frontend/common/src/utils/css/style.css';

export const cnNavigationPanel = style({
    height: '100%',
});

export const cnDashboardContainer = style({
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
});

export const cnDashboardPanels = style({
    overflowX: 'hidden',
    overflowY: 'scroll',
    flex: 1,
    height: '100%',
    backgroundColor: '#efefef',
});

export const cnDashboardDragAndDrop = style({
    position: 'fixed',
});
