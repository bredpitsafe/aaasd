import { specify } from '../../utils/css/specify';
import { style } from '../../utils/css/style.css';
import { LEFT_EDITOR_BORDER_WIDTH } from './def';

export const cnSplitViewHeader = style({
    display: 'flex',
    overflow: 'hidden',
    marginLeft: `${LEFT_EDITOR_BORDER_WIDTH}px`,
});
export const cnViewTitle = style({
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    minWidth: 0,
    marginBottom: '4px',
});
export const cnEllipsisOverflow = style({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
});
export const cnIcon = style({
    paddingRight: '4px',
});
export const cnNavigationContainer = style({
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
});
export const cnNavigationButton = style(
    specify({
        height: '22px',
    }),
);
