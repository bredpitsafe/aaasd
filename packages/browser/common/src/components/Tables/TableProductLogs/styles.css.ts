import { grey } from '@ant-design/colors';
import { globalStyle, style } from '@vanilla-extract/css';

import { specify } from '../../../utils/css/specify';

export const cnTooltip = style({
    minWidth: 'min(90vw, 400px)',
});

export const cnTooltipContainer = style({
    maxHeight: '300px',
    overflowY: 'auto',
});

export const cnFieldContainer = style({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    cursor: 'pointer',
    selectors: {
        '&:not(:last-child)': {
            marginBottom: '4px',
        },
    },
});

export const cnFieldLabel = style({
    fontWeight: 'bold',
    color: 'white',
    flex: '0 0 auto',
    position: 'relative',
    ':after': {
        content: ':',
    },
});

export const cnFieldLabelIcon = style({
    display: 'none',
    cursor: 'pointer',
});

globalStyle(`${cnFieldContainer}:hover ${cnFieldLabelIcon}`, {
    display: 'inline',
});

export const cnFieldValue = style(
    specify({
        flex: '1 0 auto',
        maxWidth: '100%',
        color: 'white',
        marginBottom: 0,
    }),
);

globalStyle(`${cnTooltipContainer} ::-webkit-scrollbar`, {
    width: 8,
});

globalStyle(`${cnTooltipContainer} ::-webkit-scrollbar-thumb`, {
    background: grey[6],
});

globalStyle(`${cnTooltipContainer} ::-webkit-scrollbar-thumb:hover`, {
    background: grey[8],
});
