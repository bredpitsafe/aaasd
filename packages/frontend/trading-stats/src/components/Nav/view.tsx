import { BuildOutlined, CalendarOutlined } from '@ant-design/icons';
import type { ValueOf } from '@common/types';
import {
    ETradingStatsPageProps,
    ETradingStatsSelectors,
} from '@frontend/common/e2e/selectors/trading-stats/trading-stats.page.selectors';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { Button } from '@frontend/common/src/components/Button';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import { Link } from '@frontend/common/src/components/Link';
import { ConnectedNav } from '@frontend/common/src/components/Nav';
import type { TNavChildRenderFunction } from '@frontend/common/src/components/Nav/view';
import { cnSection, cnSectionFill } from '@frontend/common/src/components/Nav/view.css';
import type { TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

import type { TOneOfTradingStatsRouteParams } from '../../modules/router/defs';
import { ETradingStatsRoutes } from '../../modules/router/defs';
import { cnFloatLinkButton, cnLinkButton } from './view.css';

type TNavProps = TWithClassname & {
    routeName?: ValueOf<typeof ETradingStatsRoutes>;
    routeParams?: TOneOfTradingStatsRouteParams;
    components: string[];
    openModalSettings: VoidFunction;
    onResetLayout: VoidFunction;
    onResetToSaved: VoidFunction;
};

export function Nav({
    className,
    routeName,
    routeParams,
    components,
    openModalSettings,
    onResetLayout,
    onResetToSaved,
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
                </>
            );
        },
        [routeName, routeParams],
    );

    return (
        <ConnectedNav
            flexLayoutControls
            appSwitchControls
            stageSwitchControls
            timeZoneIndicator
            layoutComponents={components}
            className={className}
            onOpenModalSettings={openModalSettings}
            onResetLayout={onResetLayout}
            onResetToSavedLayout={onResetToSaved}
        >
            {cbRenderChildren}
        </ConnectedNav>
    );
}
