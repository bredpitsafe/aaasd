import { BuildOutlined, CalendarOutlined } from '@ant-design/icons';
import {
    ETradingStatsPageProps,
    ETradingStatsSelectors,
} from '@frontend/common/e2e/selectors/trading-stats/trading-stats.page.selectors';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { ConnectedAddTabButton } from '@frontend/common/src/components/AddTabButton/ConnectedAddTabButton';
import { Button } from '@frontend/common/src/components/Button';
import { ConnectedStageSwitch } from '@frontend/common/src/components/connectedComponents/ConnectedStageSwitch';
import { Divider } from '@frontend/common/src/components/Divider';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import { LayoutReset } from '@frontend/common/src/components/LayoutReset';
import { Link } from '@frontend/common/src/components/Link';
import { ConnectedNav as CommonNav } from '@frontend/common/src/components/Nav';
import { TNavChildRenderFunction } from '@frontend/common/src/components/Nav/view';
import { cnDivider, cnSection, cnSectionFill } from '@frontend/common/src/components/Nav/view.css';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { LayoutDraftSaver } from '@frontend/common/src/widgets/LayoutDraftSaver';
import cn from 'classnames';
import { ReactElement, useCallback } from 'react';
import { ValueOf } from 'webactor';

import { ETradingStatsRoutes, TOneOfTradingStatsRouteParams } from '../../modules/router/defs';
import { cnFloatLinkButton, cnLinkButton } from './view.css';

type TNavProps = TWithClassname & {
    routeName?: ValueOf<typeof ETradingStatsRoutes>;
    routeParams?: TOneOfTradingStatsRouteParams;
    components: string[];
    onResetLayout: VoidFunction;
    onResetToSaved: VoidFunction;
    openModalSettings: VoidFunction;
};

export function Nav({
    className,
    routeName,
    routeParams,
    components,
    onResetLayout,
    onResetToSaved,
    openModalSettings,
}: TNavProps): ReactElement {
    const cbRenderChildren: TNavChildRenderFunction = useCallback(
        ({ type, collapsed }) => {
            if (type === ENavType.Hidden) {
                return (
                    <>
                        <Link
                            routeName={ETradingStatsRoutes.Daily}
                            routeParams={routeParams}
                            className={cnFloatLinkButton}
                        >
                            <FloatButton
                                {...ETradingStatsPageProps[ETradingStatsSelectors.DailyStatsButton]}
                                tooltip="Daily Stats"
                                icon={<CalendarOutlined />}
                                type={
                                    routeName === ETradingStatsRoutes.Daily ? 'primary' : 'default'
                                }
                            />
                        </Link>

                        <Link
                            routeName={ETradingStatsRoutes.Monthly}
                            routeParams={routeParams}
                            className={cnFloatLinkButton}
                        >
                            <FloatButton
                                {...ETradingStatsPageProps[
                                    ETradingStatsSelectors.MonthlyStatsButton
                                ]}
                                tooltip="Monthly Stats"
                                icon={<BuildOutlined />}
                                type={
                                    routeName === ETradingStatsRoutes.Monthly
                                        ? 'primary'
                                        : 'default'
                                }
                            />
                        </Link>
                        <ConnectedStageSwitch
                            size="large"
                            type="float"
                            settingsStoreName={EApplicationName.TradingStats}
                        />
                    </>
                );
            }

            return (
                <>
                    <div className={cn(cnSection, cnSectionFill)}>
                        {routeName ? (
                            <>
                                <Link
                                    routeName={ETradingStatsRoutes.Daily}
                                    routeParams={routeParams}
                                    className={cnLinkButton}
                                >
                                    <Button
                                        {...ETradingStatsPageProps[
                                            ETradingStatsSelectors.DailyStatsButton
                                        ]}
                                        title="Daily Stats"
                                        icon={<CalendarOutlined />}
                                        type={
                                            routeName === ETradingStatsRoutes.Daily
                                                ? 'primary'
                                                : 'default'
                                        }
                                    >
                                        {collapsed ? null : 'Daily Stats'}
                                    </Button>
                                </Link>

                                <Link
                                    routeName={ETradingStatsRoutes.Monthly}
                                    routeParams={routeParams}
                                    className={cnLinkButton}
                                >
                                    <Button
                                        {...ETradingStatsPageProps[
                                            ETradingStatsSelectors.MonthlyStatsButton
                                        ]}
                                        title="Monthly Stats"
                                        icon={<BuildOutlined />}
                                        type={
                                            routeName === ETradingStatsRoutes.Monthly
                                                ? 'primary'
                                                : 'default'
                                        }
                                    >
                                        {collapsed ? null : 'Monthly Stats'}
                                    </Button>
                                </Link>
                            </>
                        ) : null}
                    </div>
                    <div className={cnSection}>
                        <LayoutDraftSaver size="middle" type={collapsed ? 'icon' : 'icon-label'} />
                        <ConnectedAddTabButton size="middle" components={components}>
                            {collapsed ? null : 'Add Components'}
                        </ConnectedAddTabButton>
                        <LayoutReset
                            onResetToDefault={onResetLayout}
                            onResetToSaved={onResetToSaved}
                            size="middle"
                            type={collapsed ? 'icon' : 'icon-label'}
                        />
                        <Divider type="horizontal" className={cnDivider} />
                        <ConnectedStageSwitch
                            size="middle"
                            type={collapsed ? 'icon' : 'icon-label'}
                            settingsStoreName={EApplicationName.TradingStats}
                        />
                    </div>
                </>
            );
        },
        [components, onResetLayout, onResetToSaved, routeName, routeParams],
    );

    return (
        <CommonNav
            appName={EApplicationName.TradingStats}
            className={className}
            onOpenModalSettings={openModalSettings}
        >
            {cbRenderChildren}
        </CommonNav>
    );
}
