import { createTestProps } from '@frontend/common/e2e';
import { ETablesModalSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/tables.modal.selectors';
import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { Space } from '@frontend/common/src/components/Space';
import { useModule } from '@frontend/common/src/di/react';
import { EComponentCommands } from '@frontend/common/src/modules/actions/def.ts';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { EComponentConfigType, EComponentType } from '@frontend/common/src/types/domain/component';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import {
    isFailValueDescriptor,
    matchValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { DockLocation } from 'flexlayout-react';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { memo } from 'react';

import { AddComponentTabButton } from '../../components/AddComponentTabButton';
import { GroupView } from '../../components/Menu/Group';
import { useComponents } from '../../hooks/components.ts';
import { EDefaultLayoutComponents } from '../../layouts/default';
import { ComponentsOverallStatus } from '../ComponentsOverallStatus';
import { CurrentNodeGatesAction } from '../CurrentNodeGatesAction';
import { WidgetPageTitle } from '../PageTitle/WidgetPageTitle';
import { WidgetCopyRobots } from '../WidgetCopyRobots';
import { WidgetGates } from '../WidgetGates';
import { WidgetRobots } from '../WidgetRobots';
import { WidgetServers } from '../WidgetServers';
import { cnComponents, cnRoot } from './WidgetMenu.css';

export const WidgetMenu = memo((): ReactElement | null => {
    const { upsertTab } = useModule(ModuleLayouts);

    const components = useComponents();

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

    if (isNil(components)) {
        return <LoadingOverlay text="Initializing..." />;
    }

    return matchValueDescriptor(components, {
        unsynced: (vd) =>
            isFailValueDescriptor(vd) ? (
                <Error
                    title="There are no available servers"
                    subTitle="Perhaps you don't have enough permissions"
                />
            ) : (
                <LoadingOverlay text="Loading..." />
            ),
        synced: () => (
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
                            <Space size="small">
                                <WidgetCopyRobots />
                                <AddComponentTabButton
                                    configType={EComponentConfigType.robot}
                                    onClick={cbAddComponentTab}
                                />
                            </Space>
                        }
                    >
                        <WidgetRobots />
                    </GroupView>
                </div>
            </div>
        ),
    });
});
