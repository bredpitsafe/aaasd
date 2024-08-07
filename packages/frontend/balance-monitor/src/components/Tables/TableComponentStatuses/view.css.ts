import { green, grey } from '@ant-design/colors';
import { EComponentStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnActionCellClass = style({
    padding: 0,
});

export const cnStatusCommon = style({
    display: 'block',
    textAlign: 'center',
    height: '100%',
    width: '100%',
});

export const cnStatusStyles = {
    [EComponentStatus.Starting]: style({ backgroundColor: green[1] }),
    [EComponentStatus.Started]: style({ backgroundColor: 'rgba(0, 128, 0, 0.539)' }),
    [EComponentStatus.Failed]: style({ backgroundColor: 'rgba(255, 0, 0, 0.917)' }),
    [EComponentStatus.Alarm]: style({ backgroundColor: 'rgba(255, 170, 0, 0.503)' }),
    [EComponentStatus.Stopped]: style({ backgroundColor: grey[1] }),
};
