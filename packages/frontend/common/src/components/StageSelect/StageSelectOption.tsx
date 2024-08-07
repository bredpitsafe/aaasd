import { HddOutlined } from '@ant-design/icons';
import type { EApplicationName } from '@common/types';
import type { MouseEvent } from 'react';

import { ConnectedFavStage } from '../connectedComponents/ConnectedFavStage';
import { cnFavoriteButton, cnOption, cnStageIcon } from './StageSelect.css.ts';
import type { TStage } from './StageSelect.tsx';

type TStageSelectOptionProps = {
    appName: EApplicationName;
    stage: TStage;
};

export const StageSelectOption = (props: TStageSelectOptionProps) => {
    return (
        <div className={cnOption}>
            <HddOutlined className={cnStageIcon[props.stage.tag]} />
            <span>{props.stage.name}</span>
            <div
                className={cnFavoriteButton}
                onClick={stopPropagation}
                onMouseDown={stopPropagation}
            >
                <ConnectedFavStage appName={props.appName} stageName={props.stage.name} />
            </div>
        </div>
    );
};

function stopPropagation(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
}
