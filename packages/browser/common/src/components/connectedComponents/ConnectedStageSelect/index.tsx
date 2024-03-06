import { ComponentProps, ReactElement, useMemo } from 'react';

import { TSettingsStoreName } from '../../../actors/Settings/db';
import { buildStage, useStages } from '../../../hooks/useStages';
import { TWithClassname } from '../../../types/components';
import { TSocketName } from '../../../types/domain/sockets';
import { getProductionSocketsList } from '../../../utils/url';
import { StageSelect } from '../../StageSelect/StageSelect';

type TStageSelectProps = ComponentProps<typeof StageSelect>;

type TProps = TWithClassname & {
    size: TStageSelectProps['size'];
    type: TStageSelectProps['type'];
    bordered?: TStageSelectProps['bordered'];
    settingsStoreName: TSettingsStoreName;
    onChangeSocket: (name: TSocketName) => void;
    current: TSocketName;
};

export function ConnectedStageSelect({
    size,
    type,
    bordered,
    className,
    settingsStoreName,
    onChangeSocket,
    current,
}: TProps): ReactElement | null {
    const prodStages = useMemo(() => getProductionSocketsList(), []);
    const active = useMemo(() => buildStage(current, prodStages), [current, prodStages]);
    const { favorite, rarelyUsed } = useStages(settingsStoreName);

    return (
        <StageSelect
            className={className}
            onStageChange={onChangeSocket}
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
