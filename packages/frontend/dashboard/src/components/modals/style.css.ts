import { blue, green, grey, orange, red } from '@ant-design/colors';
import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import { specify } from '@frontend/common/src/utils/css/specify';
import { globalStyle, style } from '@vanilla-extract/css';

export const cnEveryoneRow = style({
    fontWeight: 'bold',
});

export const cnPermissionsContainer = style({
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'nowrap',
    gap: '2px',
    padding: '1px',
});

export const cnPermissionIcon = style({
    display: 'inline-flex',
    width: '20px',
    height: '20px',
    minWidth: '20px',
    border: '1px solid black',
    borderRadius: '4px',
    justifyContent: 'center',
    fontWeight: 'normal',
    backgroundColor: 'white',
    cursor: 'pointer',
});

export const cnPermissionIconDisabled = style({
    borderColor: grey[1],
    color: grey[1],
    backgroundColor: 'white',
    cursor: 'not-allowed',
});

export const cnPermissionIconSelected = {
    [EStorageDashboardPermission.None]: style({
        backgroundColor: blue[2],
        borderColor: blue[6],
    }),
    [EStorageDashboardPermission.Viewer]: style({
        backgroundColor: green[2],
        borderColor: green[6],
    }),
    [EStorageDashboardPermission.Editor]: style({
        backgroundColor: orange[2],
        borderColor: orange[6],
    }),
    [EStorageDashboardPermission.Owner]: style({
        backgroundColor: red[2],
        borderColor: red[6],
    }),
};

export const cnPermissionsGrid = style({});

globalStyle('.ag-popup-child', {
    zIndex: 1000,
});

export const cnPermissionsGridContainer = style({
    height: '400px',
});

export const cnContainer = style({
    width: '100%',
});

export const cnDashboardNameHeader = style(
    specify({
        fontSize: 'larger',
        fontWeight: 'bold',
        marginBottom: 0,
    }),
);

export const cnDashboardNameOverlay = style({
    minWidth: '700px',
});

export const cnPermissionsModalLoadingOverlay = style({
    minHeight: '465px',
});

globalStyle(`${cnDashboardNameOverlay} .ant-tooltip-inner`, {
    minWidth: '500px',
});
