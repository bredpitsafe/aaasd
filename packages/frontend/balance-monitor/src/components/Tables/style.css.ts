import { blue, green, grey, yellow } from '@ant-design/colors';
import { styleTableHeaderFilterInput } from '@frontend/common/src/components/AgTable/styles';
import { ERuleActualStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnAnchor = style({
    textDecoration: 'none',
    cursor: 'pointer',
    ':hover': {
        color: blue[8],
    },
});

export const cnAccountContainer = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

export const cnAccountCellDropdownIcon = style({ fontSize: '12px' });

export const cnStatusCommon = style({
    display: 'block',
    textAlign: 'center',
    height: '100%',
    width: '100%',
    color: 'black',
});

// Colors are ported directly from old ATF platform due to @serg's request
// @see https://gitlab.advsys.work/business-intelligence/deploy-prod/atf-2.5/frontend/-/blob/master/src/styles/aggrid.scss#L71
export const cnTransactionStatusStyles = {
    pending: style({ backgroundColor: 'rgba(255, 170, 0, 0.503)' }),
    error: style({ backgroundColor: 'rgba(255, 0, 0, 0.917)' }),
    succeeded: style({ backgroundColor: 'rgba(0, 128, 0, 0.539)' }),
};

export const cnBalanceMonitorTable = style({
    vars: {
        '--ag-font-size': '13px',
        '--ag-list-item-height': '30px',
        '--ag-row-height': '30px',
    },
});

export const cnTransferBlockingRuleStatusStyles = {
    [ERuleActualStatus.Active]: style({ backgroundColor: green[3] }),
    [ERuleActualStatus.Expired]: style({ backgroundColor: grey[0] }),
    [ERuleActualStatus.Waiting]: style({ backgroundColor: yellow[3] }),
};

export const cnRoot = style({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
});

styleTableHeaderFilterInput(cnRoot, {
    fontSize: '16px',
});

export const cnCenterCellContent = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});
