import { style } from '../utils/css/style.css';

export const cnItem = style({
    [`:first-of-type`]: {
        paddingTop: 0,
    },
    [`:last-of-type`]: {
        paddingBottom: 0,
    },
});
