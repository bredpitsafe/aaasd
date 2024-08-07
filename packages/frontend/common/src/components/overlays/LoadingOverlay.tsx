import { Loading3QuartersOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash-es';
import { useEffect, useState } from 'react';

import { useFunction } from '../../utils/React/useFunction';
import { cnContainer, cnDescription, cnSpinner } from './LoadingOverlay.css';
import type { TOverlayProps } from './Overlay';
import { Overlay } from './Overlay';

export type TLoadingOverlayProps = Omit<TOverlayProps, 'children'> & {
    text?: string;
};

const FRAMES = 10;
const FRAME_DELAY = 100;

export function LoadingOverlay(props: TLoadingOverlayProps) {
    const { text, ...overlayProps } = props;

    const [frame, setFrame] = useState(0);

    const updateFrame = useFunction(() => setFrame((frame + 1) % FRAMES));

    useEffect(() => {
        const interval = setInterval(updateFrame, FRAME_DELAY);
        return () => clearInterval(interval);
    }, [updateFrame]);

    return (
        <Overlay {...overlayProps}>
            <div className={cnContainer}>
                <Loading3QuartersOutlined
                    className={cnSpinner}
                    style={{ transform: `rotate(${Math.trunc((frame * 360) / FRAMES)}deg)` }}
                />
                {!isEmpty(text) && <p className={cnDescription}>{text}</p>}
            </div>
        </Overlay>
    );
}
