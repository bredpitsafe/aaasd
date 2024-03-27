import { HddOutlined } from '@ant-design/icons';
import cn from 'classnames';
import { isEmpty, isEqual, isUndefined } from 'lodash-es';
import { ComponentProps, memo, MouseEvent, useEffect, useMemo, useState } from 'react';

import { createTestProps } from '../../../e2e';
import { EMainMenuModalSelectors } from '../../../e2e/selectors/main-menu.modal.selectors';
import { TSettingsStoreName } from '../../actors/Settings/db';
import { TWithClassname } from '../../types/components';
import { ESocketType, TSocketName } from '../../types/domain/sockets';
import { useFunction } from '../../utils/React/useFunction';
import { Button } from '../Button';
import { ConnectedFavStage } from '../connectedComponents/ConnectedFavStage';
import { FloatButton } from '../FloatButton';
import { Select } from '../Select';
import {
    cnFakeButton,
    cnFavoriteButton,
    cnOption,
    cnSelect,
    cnStageIcon,
    cnWrapper,
} from './StageSelect.css';

export type TStage = {
    name: TSocketName;
    tag: ESocketType;
};

type TSelectProps = Omit<
    ComponentProps<typeof Select<TSocketName>>,
    'options' | 'onChange' | 'open' | 'value' | 'showSearch' | 'placeholder'
>;

type TProps = TWithClassname &
    Omit<TSelectProps, 'options' | 'onChange' | 'open' | 'value' | 'showSearch' | 'placeholder'> & {
        favoriteStages: TStage[];
        rarelyUsedStages?: TStage[];
        active?: TStage;
        onStageChange: (name: TSocketName) => void;
        type: 'icon-label' | 'icon' | 'float';
        settingsStoreName?: TSettingsStoreName;
    };

export const StageSelect = memo((props: TProps) => {
    const {
        className,
        type,
        active,
        onStageChange,
        bordered,
        settingsStoreName,
        favoriteStages,
        rarelyUsedStages,
        ...selectProps
    } = props;
    const [currentFavoriteStages, setCurrentFavoriteStages] = useState<TStage[]>(favoriteStages);
    const [currentRarelyUsedStages, setCurrentRarelyUsedStages] = useState<TStage[] | undefined>(
        rarelyUsedStages,
    );
    const [isHover, setIsHover] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(props.defaultOpen ?? false);
    const isActive = isHover || isFocused;
    const isIconLabel = type === 'icon-label';
    const isCompactLabel = type === 'float' || type === 'icon';

    const buildOption = useFunction((s: TStage) => ({
        label: (
            <div className={cnOption}>
                <HddOutlined className={cnStageIcon[s.tag]} />
                <span>{s.name}</span>
                <div
                    className={cnFavoriteButton}
                    onClick={stopPropagation}
                    onMouseDown={stopPropagation}
                >
                    {settingsStoreName && (
                        <ConnectedFavStage
                            stageName={s.name}
                            settingsStoreName={settingsStoreName}
                        />
                    )}
                </div>
            </div>
        ),
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

        groups.push({
            label: 'Production',
            options: currentRarelyUsedStages
                .filter((s) => s.tag === ESocketType.Production)
                .map((s) => buildOption(s)),
        });

        groups.push({
            label: 'Dev',
            options: currentRarelyUsedStages
                .filter((s) => s.tag === ESocketType.Development)
                .map((s) => buildOption(s)),
        });

        return groups;
    }, [currentFavoriteStages, currentRarelyUsedStages, buildOption]);

    const ButtonComponent = type === 'float' ? FloatButton : Button;

    const handleFocus = useFunction(() => setIsFocused(true));
    const handleBlur = useFunction(() => setIsFocused(false));
    const handleMouseEnter = useFunction(() => setIsHover(true));
    const handleMouseLeave = useFunction(() => setIsHover(false));

    // Only update stages list when select is closed or when the current list is empty
    useEffect(() => {
        if (
            (!isFocused || isUndefined(currentRarelyUsedStages)) &&
            !isEqual(rarelyUsedStages, currentRarelyUsedStages)
        ) {
            setCurrentRarelyUsedStages(rarelyUsedStages);
        }
    }, [currentRarelyUsedStages, rarelyUsedStages, isFocused]);

    // Only update favorite stages when select is closed
    useEffect(() => {
        if (!isFocused && !isEqual(favoriteStages, currentFavoriteStages)) {
            setCurrentFavoriteStages(favoriteStages);
        }
    }, [currentFavoriteStages, favoriteStages, isFocused]);

    const selectElement = (
        <Select
            {...createTestProps(EMainMenuModalSelectors.StageSwitchSelector)}
            {...selectProps}
            open={isFocused}
            value={active?.name}
            showSearch
            options={options}
            onChange={onStageChange}
            showArrow={false}
            className={cn(isIconLabel && className, {
                [cnSelect.static]: isIconLabel,
                [cnSelect.idle]: isCompactLabel && !isActive,
                [cnSelect.active]: isCompactLabel && isActive,
            })}
            placeholder={isIconLabel && 'Select stage'}
            onFocus={handleFocus}
            onMouseEnter={handleMouseEnter}
            onBlur={handleBlur}
            onMouseLeave={handleMouseLeave}
            onDropdownVisibleChange={setIsFocused}
            dropdownMatchSelectWidth={false}
        />
    );

    if (isIconLabel) {
        return selectElement;
    }

    return (
        <div className={cnWrapper}>
            <ButtonComponent
                size={props.size}
                icon={<HddOutlined className={active ? cnStageIcon[active.tag] : undefined} />}
                className={cnFakeButton}
                tabIndex={-1}
                type={type === 'float' ? undefined : bordered === false ? 'default' : undefined}
            />
            {selectElement}
        </div>
    );
});

function stopPropagation(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
}
