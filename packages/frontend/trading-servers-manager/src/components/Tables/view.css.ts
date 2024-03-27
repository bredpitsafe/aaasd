import { specify } from '@frontend/common/src/utils/css/specify.ts';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
});

export const cnInstrumentContainer = style(
    specify({
        minWidth: '400px',
        flex: '3 1 400px',
        height: 26,
        marginRight: 0,
    }),
);

export const cnVirtualAccountContainer = style(
    specify({
        minWidth: '300px',
        flex: '2 1 300px',
        height: 26,
        marginRight: 0,
    }),
);

export const cnAssetContainer = style(
    specify({
        minWidth: '200px',
        flex: '1 1 300px',
        height: 26,
        marginRight: 0,
    }),
);

export const cnRobotContainer = style(
    specify({
        minWidth: '300px',
        flex: '2 1 300px',
        height: 26,
        marginRight: 0,
    }),
);

export const cnNonZeroSwitch = style(
    specify({
        height: 26,
    }),
);

export const cnFullWidth = style(
    specify({
        flex: '1 1 auto',
    }),
);

export const cnMultiFilterRow = style({
    gap: 2,
    marginBottom: 2,
});
