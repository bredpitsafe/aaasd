import { grey } from '@ant-design/colors';
import { EInstrumentStatus } from '@frontend/common/src/types/domain/instrument';
import { blue, green, orange, red } from '@frontend/common/src/utils/colors';
import type { Properties } from 'csstype';
import type { ReactElement } from 'react';
import { memo } from 'react';

type TStatusRendererProps = {
    status?: EInstrumentStatus;
};

const style: Record<EInstrumentStatus, Properties> = {
    [EInstrumentStatus.Trading]: {
        color: green[5],
    },
    [EInstrumentStatus.CloseOnly]: {
        color: grey[0], // WHAT IS A COLOR?
    },
    [EInstrumentStatus.Delisted]: {
        color: red[5],
    },
    [EInstrumentStatus.CancelOnly]: {
        color: blue[5],
    },
    [EInstrumentStatus.Halt]: {
        color: orange[5],
    },
    [EInstrumentStatus.Forbidden]: {
        color: grey[0], // WHAT IS A COLOR?
    },
};

export const StatusRenderer = memo((props: TStatusRendererProps): ReactElement | null => {
    if (props.status === undefined) {
        return null;
    }

    return <span style={style[props.status]}>{props.status}</span>;
});
