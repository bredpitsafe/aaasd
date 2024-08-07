import { globalStyle } from '@vanilla-extract/css';

import { ENavType } from '../../actors/Settings/types';
import { specify } from '../../utils/css/specify';
import { style, styleVariants } from '../../utils/css/style.css';
import { withBorder } from '../mixins';

const cnRootBase = style(
    style({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '12px',
        transition: 'width .3s ease-in-out, padding .3s ease-in-out',
    }),
    {
        backgroundColor: 'white',
        ...withBorder('borderRight'),
    },
);

export const cnRoot = styleVariants({
    [ENavType.Full]: [
        cnRootBase,
        {
            width: '230px',
        },
    ],
    [ENavType.Small]: [
        cnRootBase,
        {
            width: '58px',
        },
    ],
    [ENavType.Hidden]: [
        cnRootBase,
        {
            width: '0px',
            padding: '12px 0',
            overflow: 'hidden',
        },
    ],
});

export const cnSection = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
});

export const cnSectionRow = style(
    specify({
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    }),
);

export const cnSectionFill = style({
    flexGrow: 1,
});
export const cnDivider = style({
    margin: '8px 0',
});
export const cnDividerInvertedColor = style({
    margin: '8px 0',
    borderTopColor: 'rgba(250, 250, 250, 0.3)',
});

export const cnBTRunIndicator = style({
    margin: '0 -12px',
});

export const cnShowNavButton = style({
    bottom: '16px',
    left: '16px',
    opacity: '0.3',
    ':hover': {
        opacity: '1',
    },
});
export const cnShowNavButtonTop = style({
    bottom: 'unset',
    top: '16px',
});

export const cnNavBottomFull = style({
    selectors: {
        [`&:not(${cnSectionRow})`]: {
            '@media': {
                'screen and (max-height: 820px)': {
                    display: 'none',
                },
            },
        },
    },
});

export const cnNavBottomCollapse = style({
    '@media': {
        'screen and (min-height: 821px)': {
            display: 'none',
        },
    },
});

globalStyle('::backdrop', {
    backgroundColor: '#fff',
});
