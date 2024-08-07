import { purple } from '@frontend/common/src/utils/colors';
import { style } from '@vanilla-extract/css';

const cnColor = style({
    // Colors from purple Tag preset
    color: purple[6],
    background: purple[0],
});

export const cnWideBox = style([
    cnColor,
    {
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '0 12px',
        fontSize: '14px',
        lineHeight: '32px',
        cursor: 'pointer',
    },
]);

export const cnFloatingWideBox = style([
    cnWideBox,
    {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '229px',
        zIndex: 2,
        borderRadius: '0 4px 4px 0',
    },
]);

export const cnCompact = style([
    cnColor,
    {
        position: 'relative',
        fontSize: '12px',
        lineHeight: '14px',
        padding: '2px 4px',
        textAlign: 'center',
    },
]);

export const cnInputBox = style({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '229px',
    padding: '0 12px',
});
