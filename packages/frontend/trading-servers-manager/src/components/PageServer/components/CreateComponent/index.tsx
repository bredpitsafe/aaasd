import { generateTraceId } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleCreateConfigOnCurrentStage } from '@frontend/common/src/modules/actions/config/ModuleCreateConfigOnCurrentStage.ts';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import { EComponentConfigType } from '@frontend/common/src/types/domain/component';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { useCurrentServerId } from '../../../../hooks/servers.ts';
import { EDefaultLayoutComponents } from '../../../../layouts/default';
import { ETradingServersManagerRoutes } from '../../../../modules/router/defs';
import type { CreateComponentFormValues } from './view';
import { CreateComponent } from './view';

export type TConnectedCreateComponentProps = {
    configType?: EComponentConfigType;
};

export function ConnectedCreateComponent(props: TConnectedCreateComponentProps): ReactElement {
    const { deleteTab } = useModule(ModuleLayouts);
    const { navigate, getState } = useModule(ModuleRouter);

    const serverId = useCurrentServerId();

    const [createConfig] = useNotifiedObservableFunction(
        useModule(ModuleCreateConfigOnCurrentStage),
        ADD_COMPONENT_OPTIONS,
    );
    const cbSubmit = useFunction(async (values: CreateComponentFormValues) => {
        const { configType, config, name, kind } = values;

        assert(!isNil(serverId), 'Server ID is not defined');

        // Submit component to backend
        const { id } = await createConfig(
            { nodeId: serverId, configType, config, name, kind },
            { traceId: generateTraceId() },
        );

        // Close tab after successful config creation
        deleteTab(EDefaultLayoutComponents.AddComponent);

        // Redirect to newly-created component using its id
        switch (configType) {
            case EComponentConfigType.robot: {
                return navigate(ETradingServersManagerRoutes.Robot, {
                    ...getState()?.route.params,
                    robot: id,
                });
            }
            case EComponentConfigType.mdGate:
            case EComponentConfigType.execGate: {
                return navigate(ETradingServersManagerRoutes.Gate, {
                    ...getState()?.route.params,
                    gate: id,
                });
            }
        }
    });

    return <CreateComponent configType={props.configType} onSubmit={cbSubmit} />;
}

const ADD_COMPONENT_OPTIONS = {
    getNotifyTitle: () => ({
        loading: 'Creating component...',
        success: 'Component has been created successfully',
    }),
};
