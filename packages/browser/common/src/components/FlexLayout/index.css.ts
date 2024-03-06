import { globalStyle } from '@vanilla-extract/css';
import { CLASSES } from 'flexlayout-react';

globalStyle(`.${CLASSES.FLEXLAYOUT__LAYOUT}`, {
    vars: {
        '--font-size': '14px',
    },
});
