import { memo } from 'react';

import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '../../../../e2e/selectors/main-menu.modal.selectors';
import { useStages } from '../../../hooks/useStages';
import { useStageSwitch } from '../../../hooks/useStageSwitch';
import type { TWithClassname } from '../../../types/components';
import type { TSocketName } from '../../../types/domain/sockets';
import type { TStageSelectProps } from '../../StageSelect/StageSelect';
import { StageSelect } from '../../StageSelect/StageSelect';

export enum ELoaderType {
    Full = 'full',
    Small = 'small',
}

type TProps = TWithClassname &
    Omit<TStageSelectProps, 'favoriteStages' | 'rarelyUsedStages' | 'onStageChange'> & {
        onChangeSocket?: (name: TSocketName) => void;
        keepRestParams?: boolean;
    };

export const ConnectedStageSwitch = memo(
    ({ onChangeSocket, keepRestParams, ...selectProps }: TProps) => {
        const changeStage = useStageSwitch(keepRestParams);
        const { favorite, rarelyUsed, active, loading } = useStages();

        return (
            <StageSelect
                {...EMainMenuProps[EMainMenuModalSelectors.StageSwitchSelector]}
                onStageChange={onChangeSocket ?? changeStage}
                favoriteStages={favorite}
                rarelyUsedStages={rarelyUsed}
                active={active}
                loading={loading}
                {...selectProps}
            />
        );
    },
);
