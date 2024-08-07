import { blue, green, orange, red } from '@ant-design/colors';
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
        minWidth: 400,
        flex: '3 1 400px',
        height: 26,
        marginRight: 0,
    }),
);

export const cnVirtualAccountContainer = style(
    specify({
        minWidth: 300,
        flex: '2 1 300px',
        height: 26,
        marginRight: 0,
    }),
);

export const cnAssetContainer = style(
    specify({
        minWidth: 300,
        flex: '1 1 300px',
        height: 26,
        marginRight: 0,
    }),
);

export const cnRobotContainer = style(
    specify({
        minWidth: 300,
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
    flex: '0 0 auto',
    overflow: 'hidden',
});

export const cnEnumValue = style({
    display: 'block',
    height: '100%',
    width: '100%',
    color: 'black',
});

const cnBaseStatus = style({
    fontWeight: 'bold',
});

export const cnStatusStyles = {
    error: style(cnBaseStatus, { color: red[6] }),
    succeeded: style(cnBaseStatus, { color: green[6] }),
    normal: style(cnBaseStatus, { color: blue[6] }),
};

export const cnInfoTooltipIcon = style({
    marginLeft: 8,
});

export const cnInstrumentHeaderContainer = style({
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    width: '100%',
});

export const cnInstrumentHeaderName = style({
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
});

export const cnInstrumentHeaderIcon = style({
    ':hover': {
        color: red[7],
        fontSize: 14,
    },
});

export const cnStepPriceTooltip = style(
    specify({
        maxWidth: 'none',
    }),
);

export const cnStepPriceTooltipTable = style(
    specify({
        width: 250,
    }),
);

export const cnFullCellSize = style({
    width: '100%',
    height: '100%',
});

export const cnErrorDescription = style({
    marginBottom: 0,
});

export const cnInstrumentRevisionsSelector = style({
    ':hover': {
        color: blue[6],
        cursor: 'pointer',
    },
});

export const cnInstrumentRevisionsIcon = style({
    marginLeft: 8,
});

export const cnRevisionSelectorDropdown = style({
    padding: '2px 2px',
    borderRadius: 6,
    background: 'white',
    overflow: 'hidden',

    minWidth: '180px !important', // we need to override inline style

    boxShadow:
        '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
});

export const cnRevisionList = style({
    borderRadius: 6,
    overflow: 'hidden',
});

export const cnRevisionActionListItem = style(specify({ padding: 1 }));

export const cnRevisionAction = style({
    flex: 1,
});

export const cnRevisionItem = style({
    ...specify({ padding: '2px 8px' }),
    width: 235,
    cursor: 'pointer',
    ':hover': {
        backgroundColor: blue[1],
    },
});

export const cnRevisionItemSelected = style({
    backgroundColor: blue[2],
    ':hover': {
        backgroundColor: blue[3],
    },
});

export const cnRevisionDirty = style({
    color: orange[4],
    marginLeft: 8,
});
