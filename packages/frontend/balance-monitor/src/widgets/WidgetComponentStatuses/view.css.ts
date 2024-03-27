import { grey } from '@ant-design/colors';
import { styleTooltipContainer } from '@frontend/common/src/components/Tooltip.css';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnBadgesListContainer = style({
    display: 'flex',
    justifyContent: 'center',

    border: `1px solid ${grey[4]}`,
    padding: '5px 0px',
    borderRadius: '6px',

    overflow: 'hidden',
    cursor: 'pointer',

    ':hover': {
        borderColor: '#4096ff',
    },
});

export const cnBadgesList = style({
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '4px',
});

export const cnStatusBadge = style({
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
    justifyContent: 'space-between',
});

export const cnComponentStatusCard = style({
    width: 'min(300px, 50vw)',
    border: 0,
    borderRadius: '6px',
});

export const cnComponentBadgeHeader = style({
    marginBottom: 0,
});

export const cnComponentBadgeDescription = style({
    marginBottom: '0.3em',
});

export const cnComponentStatusCardOverlay = style({ maxWidth: 'initial' });

styleTooltipContainer(cnComponentStatusCardOverlay, { padding: '6px' });
