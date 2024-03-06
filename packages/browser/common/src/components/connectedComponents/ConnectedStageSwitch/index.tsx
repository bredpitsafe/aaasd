import { ComponentProps, ReactElement } from 'react';

import { TSettingsStoreName } from '../../../actors/Settings/db';
import { useStages } from '../../../hooks/useStages';
import { useStageSwitch } from '../../../hooks/useStageSwitch';
import { TWithClassname } from '../../../types/components';
import { TSocketName } from '../../../types/domain/sockets';
import { useFunction } from '../../../utils/React/useFunction';
import { StageSelect } from '../../StageSelect/StageSelect';

type TStageSelectProps = ComponentProps<typeof StageSelect>;
type TProps = TWithClassname & {
    size: TStageSelectProps['size'];
    type: TStageSelectProps['type'];
    bordered?: TStageSelectProps['bordered'];
    settingsStoreName: TSettingsStoreName;
    onChangeSocket?: (name: TSocketName) => void;
};

export function ConnectedStageSwitch({
    size,
    type,
    bordered,
    className,
    settingsStoreName,
    onChangeSocket,
}: TProps): ReactElement | null {
    const changeStage = useStageSwitch();
    const changeStageAndNotify = useFunction((name: TSocketName) => {
        onChangeSocket?.(name);
        changeStage(name);
    });
    const { favorite, rarelyUsed, active } = useStages(settingsStoreName);

    return (
        <StageSelect
            className={className}
            onStageChange={changeStageAndNotify}
            favoriteStages={favorite}
            rarelyUsedStages={rarelyUsed}
            active={active}
            size={size}
            type={type}
            bordered={bordered}
            settingsStoreName={settingsStoreName}
        />
    );
}
