import { createTestProps } from '@frontend/common/e2e';
import { ETablesModalSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/tables.modal.selectors';
import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { Space } from '@frontend/common/src/components/Space';
import { useModule } from '@frontend/common/src/di/react';
import { EComponentCommands } from '@frontend/common/src/handlers/def';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { EComponentConfigType, EComponentType } from '@frontend/common/src/types/domain/component';
import { assertNever } from '@frontend/common/src/utils/assert';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { matchValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor';
import { DockLocation } from 'flexlayout-react';
import { isUndefined } from 'lodash-es';
import { memo, ReactElement } from 'react';

import { AddComponentTabButton } from '../../components/AddComponentTabButton';
import { GroupView } from '../../components/Menu/Group';
import { EDefaultLayoutComponents } from '../../layouts/default';
import { ComponentsOverallStatus } from '../ComponentsOverallStatus';
import { CurrentNodeGatesAction } from '../CurrentNodeGatesAction';
import { WidgetPageTitle } from '../PageTitle/WidgetPageTitle';
import { WidgetGates } from '../WidgetGates';
import { WidgetRobots } from '../WidgetRobots';
import { WidgetServers } from '../WidgetServers';
import { cnComponents, cnRoot } from './WidgetMenu.css';

export const WidgetMenu = memo((): ReactElement | null => {
    const { serversList$ } = useModule(ModuleServers);
    const { upsertTab } = useModule(ModuleLayouts);

    const serversDescriptor = useSyncObservable(serversList$);

    const cbAddComponentTab = useFunction((configType: EComponentConfigType) => {
        upsertTab(EDefaultLayoutComponents.AddComponent, {
            json: {
                type: 'tab',
                name: EDefaultLayoutComponents.AddComponent,
                component: EDefaultLayoutComponents.AddComponent,
                config: {
                    configType,
                },
            },
            location: DockLocation.RIGHT,
            select: true,
        });
    });

    if (isUndefined(serversDescriptor)) {
        return <LoadingOverlay text="Loading components list..." />;
    }

    return matchValueDescriptor(serversDescriptor, {
        idle: () => <LoadingOverlay text="Loading" />,
        unsynchronized: () => <LoadingOverlay text="Loading" />,
        fail: (f) => {
            switch (f.code) {
                case '[ServersList]: NOT_AVAILABLE':
                    return (
                        <Error
                            title={'There are no available servers'}
                            subTitle={"Perhaps you don't have enough permissions"}
                        />
                    );
                default:
                    assertNever(f.code);
            }
        },
        synchronized: () => (
            <div className={cnRoot}>
                <WidgetPageTitle />
                <div className={cnComponents}>
                    <GroupView
                        {...createTestProps(ETablesModalSelectors.ServerTable)}
                        title={
                            <Space>
                                Servers
                                <ComponentsOverallStatus />
                            </Space>
                        }
                    >
                        <WidgetServers />
                    </GroupView>
                    <GroupView
                        {...createTestProps(ETablesModalSelectors.ExecGatesTable)}
                        title={
                            <Space>
                                Exec Gates
                                <ComponentsOverallStatus type={EComponentType.execGate} />
                            </Space>
                        }
                        extra={
                            <>
                                <CurrentNodeGatesAction
                                    size="small"
                                    gateType={EComponentType.execGate}
                                    action={EComponentCommands.StartComponent}
                                />
                                <CurrentNodeGatesAction
                                    size="small"
                                    gateType={EComponentType.execGate}
                                    action={EComponentCommands.StopComponent}
                                />
                                <AddComponentTabButton
                                    configType={EComponentConfigType.execGate}
                                    onClick={cbAddComponentTab}
                                />
                            </>
                        }
                    >
                        <WidgetGates type={EComponentType.execGate} />
                    </GroupView>
                    <GroupView
                        {...createTestProps(ETablesModalSelectors.MGGatesTable)}
                        title={
                            <Space size="small" align="center">
                                MD Gates
                                <ComponentsOverallStatus type={EComponentType.mdGate} />
                            </Space>
                        }
                        extra={
                            <>
                                <CurrentNodeGatesAction
                                    size="small"
                                    gateType={EComponentType.mdGate}
                                    action={EComponentCommands.StartComponent}
                                />
                                <CurrentNodeGatesAction
                                    size="small"
                                    gateType={EComponentType.mdGate}
                                    action={EComponentCommands.StopComponent}
                                />
                                <AddComponentTabButton
                                    configType={EComponentConfigType.mdGate}
                                    onClick={cbAddComponentTab}
                                />
                            </>
                        }
                    >
                        <WidgetGates type={EComponentType.mdGate} />
                    </GroupView>
                    <GroupView
                        {...createTestProps(ETablesModalSelectors.RobotsTable)}
                        title={
                            <Space>
                                Robots
                                <ComponentsOverallStatus type={EComponentType.robot} />
                            </Space>
                        }
                        extra={
                            <AddComponentTabButton
                                configType={EComponentConfigType.robot}
                                onClick={cbAddComponentTab}
                            />
                        }
                    >
                        <WidgetRobots />
                    </GroupView>
                </div>
            </div>
        ),
    });
});
