import { blue, green, grey, red } from '@ant-design/colors';
import { EBacktestingRunStatus } from '@frontend/common/src/types/domain/backtestings';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    display: 'flex',
});

export const cnSucceedRow = style(
    specify({
        backgroundColor: green[0],
    }),
);

export const cnRunningRow = style(
    specify({
        backgroundColor: blue[0],
    }),
);

export const cnFailedRow = style(
    specify({
        backgroundColor: red[0],
    }),
);

export const cnRunStatusContainer = style({
    display: 'inline-block',
    selectors: {
        '&:not(:last-child):after': {
            content: ' / ',
            whiteSpace: 'pre',
        },
    },
});

export const cnBadgeColor: Record<EBacktestingRunStatus, string> = {
    [EBacktestingRunStatus.Initializing]: style({
        color: grey[8],
    }),
    [EBacktestingRunStatus.Running]: style({
        color: blue[8],
    }),
    [EBacktestingRunStatus.Paused]: style({
        color: grey[6],
    }),
    [EBacktestingRunStatus.Succeed]: style({
        color: green[8],
    }),
    [EBacktestingRunStatus.Stopped]: style({
        color: red[6],
    }),
    [EBacktestingRunStatus.Failed]: style({
        color: red[8],
    }),
    [EBacktestingRunStatus.WaitingForData]: style({
        color: grey[8],
    }),
};
