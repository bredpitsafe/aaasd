import { HddOutlined } from '@ant-design/icons';
import { isEmpty, isEqual, isNil, isUndefined } from 'lodash-es';
import { memo, useEffect, useMemo, useState } from 'react';

import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '../../../e2e/selectors/main-menu.modal.selectors';
import { useAppName } from '../../hooks/useAppName.ts';
import type { TSocketName } from '../../types/domain/sockets';
import { ESocketType } from '../../types/domain/sockets';
import { useFunction } from '../../utils/React/useFunction';
import type { TEntitySelectProps } from '../EntitySelect/EntitySelect.tsx';
import { EntitySelect } from '../EntitySelect/EntitySelect.tsx';
import { cnStageIcon } from './StageSelect.css';
import { StageSelectOption } from './StageSelectOption.tsx';

export type TStage = {
    name: TSocketName;
    tag: ESocketType;
};

export type TStageSelectProps = Omit<
    TEntitySelectProps<TSocketName>,
    'onChange' | 'options' | 'value'
> & {
    favoriteStages: TStage[];
    rarelyUsedStages?: TStage[];
    active?: TStage;
    onStageChange: (name: TSocketName) => void;
};

export const StageSelect = memo((props: TStageSelectProps) => {
    const { active, onStageChange, favoriteStages, rarelyUsedStages, closable, ...selectProps } =
        props;
    const appName = useAppName();
    const [currentFavoriteStages, setCurrentFavoriteStages] = useState<TStage[]>(favoriteStages);
    const [currentRarelyUsedStages, setCurrentRarelyUsedStages] = useState<TStage[] | undefined>(
        rarelyUsedStages,
    );
    const [isFocused, setIsFocused] = useState<boolean>(props.defaultOpen ?? false);

    const handleFocus = useFunction(() => setIsFocused(true));
    const handleBlur = useFunction(() => closable && setIsFocused(false));

    const buildOption = useFunction((s: TStage) => ({
        label: <StageSelectOption appName={appName} stage={s} />,
        value: s.name,
    }));

    const options = useMemo(() => {
        if (isUndefined(currentRarelyUsedStages)) {
            return;
        }

        const groups = [];

        if (!isEmpty(currentFavoriteStages)) {
            groups.push({
                label: 'Favorite',
                options: currentFavoriteStages.map((s) => buildOption(s)),
            });
        }

        const productionStages = currentRarelyUsedStages
            .filter((s) => s.tag === ESocketType.Production)
            .map((s) => buildOption(s));
        !isEmpty(productionStages) &&
            groups.push({
                label: 'Production',
                options: productionStages,
            });

        const devStages = currentRarelyUsedStages
            .filter((s) => s.tag === ESocketType.Development)
            .map((s) => buildOption(s));
        !isEmpty(devStages) &&
            groups.push({
                label: 'Dev',
                options: devStages,
            });

        return groups;
    }, [currentFavoriteStages, currentRarelyUsedStages, buildOption]);

    // Only update stages list when select is closed or when the current list is empty or when closable === false
    useEffect(() => {
        if (
            (!(isFocused && closable) || isUndefined(currentRarelyUsedStages)) &&
            !isEqual(rarelyUsedStages, currentRarelyUsedStages)
        ) {
            setCurrentRarelyUsedStages(rarelyUsedStages);
        }
    }, [currentRarelyUsedStages, rarelyUsedStages, isFocused, closable]);

    // Only update favorite stages when select is closed or when closable === false
    useEffect(() => {
        if (!(isFocused && closable) && !isEqual(favoriteStages, currentFavoriteStages)) {
            setCurrentFavoriteStages(favoriteStages);
        }
    }, [closable, currentFavoriteStages, favoriteStages, isFocused]);

    return (
        <EntitySelect<TSocketName>
            {...EMainMenuProps[EMainMenuModalSelectors.StageSwitchSelector]}
            placeholder="Select stage"
            options={options}
            value={active?.name}
            icon={!isNil(active) ? <HddOutlined className={cnStageIcon[active.tag]} /> : null}
            closable={closable}
            onChange={onStageChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...selectProps}
        />
    );
});
