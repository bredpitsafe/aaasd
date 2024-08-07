import { blue, red } from '@ant-design/colors';
import {
    styleListAction,
    styleListActionsContainer,
    styleListActionSplit,
} from '@frontend/common/src/components/List.css';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnLoadingContainer = style({ height: '100%', textAlign: 'center' });
export const cnLoadingIcon = style({ fontSize: '32px', color: blue[6] });

const cnListItem = style(
    specify({
        cursor: 'pointer',
        borderBlockEnd: 0,
    }),
    {
        ':hover': {
            backgroundColor: blue[0],
        },
    },
);

styleListActionsContainer(cnListItem, {
    marginInlineStart: 0,
});

styleListAction(cnListItem, {
    padding: 0,
});

styleListActionSplit(cnListItem, {
    display: 'none',
});

export const cnActiveListItem = style({
    backgroundColor: blue[3],
    ':hover': {
        backgroundColor: blue[4],
    },
});

export const cnIcon = style({
    fontSize: '16px',
});

export const cnIconWrapper = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const cnEditNameAction = style({
    visibility: 'hidden',
    marginLeft: '4px',
});

globalStyle(`${cnListItem}:hover ${cnEditNameAction}`, {
    visibility: 'visible',
});

export const cnLink = style({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%',
});

globalStyle(`${cnActiveListItem}:hover ${cnLink}`, {
    color: blue[7],
});

export const cnDirtyDashboardTitle = style({
    ':before': {
        content: '*',
        paddingRight: '4px',
        color: red[6],
        fontSize: '16px',
    },
});

export const cnFullHeightCell = style({
    height: '100%',
});

export const cnScopeCell = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});
