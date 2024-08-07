import type { EApplicationName, Nil } from '@common/types';
import type { MenuProps } from '@frontend/common/src/components/Menu.tsx';
import { Menu } from '@frontend/common/src/components/Menu.tsx';
import { ECommonSettings } from '@frontend/common/src/components/Settings/def.ts';
import { StageSelectOption } from '@frontend/common/src/components/StageSelect/StageSelectOption.tsx';
import type { TooltipProps } from '@frontend/common/src/components/Tooltip.tsx';
import { Tooltip } from '@frontend/common/src/components/Tooltip.tsx';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { buildStage } from '@frontend/common/src/hooks/useStages.ts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import type { TWithChildren, TWithClassname } from '@frontend/common/src/types/components.ts';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { getProductionSocketsList } from '@frontend/common/src/utils/url.ts';
import { getAppSocketUrl } from '@frontend/common/src/utils/urlBuilders.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { cnTooltip } from './FavoriteStages.css.ts';

type TFavoriteStagesProps = TWithClassname &
    TWithChildren &
    TooltipProps & {
        appName: EApplicationName;
    };

export const FavoriteStages = (props: TFavoriteStagesProps) => {
    const { appName, children, className, ...tooltipProps } = props;
    const { getAppSettings$ } = useModule(ModuleSettings);
    const prodStages = useMemo(() => getProductionSocketsList(), []);

    const stages$ = useMemo(
        () => getAppSettings$(appName, ECommonSettings.FavoriteStages),
        [appName],
    );
    const stages = useNotifiedValueDescriptorObservable(stages$);

    const favoriteStages = stages?.value ?? [];

    const tooltipContents = useMemo(() => {
        const items: MenuProps['items'] = (favoriteStages as TSocketName[] | Nil)?.map((name) => ({
            key: name,
            value: name,
            label: (
                <a href={getAppSocketUrl(appName, name)}>
                    <StageSelectOption
                        key={name}
                        appName={appName}
                        stage={buildStage(name, prodStages)}
                    />
                </a>
            ),
        }));
        return <Menu items={items} />;
    }, [favoriteStages, appName, prodStages]);

    if (isNil(stages) || !isSyncedValueDescriptor(stages) || isNil(stages.value)) {
        return <>{children ?? null}</>;
    }

    return (
        <Tooltip
            trigger="hover"
            placement="bottom"
            color="white"
            overlayClassName={cn(cnTooltip, className)}
            mouseEnterDelay={0}
            title={tooltipContents}
            {...tooltipProps}
        >
            {children}
        </Tooltip>
    );
};
