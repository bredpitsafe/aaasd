import { useModule } from '@frontend/common/src/di/react';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import { EComponentConfigType } from '@frontend/common/src/types/domain/component';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { ReactElement } from 'react';
import { firstValueFrom } from 'rxjs';

import { EDefaultLayoutComponents } from '../../../../layouts/default';
import { ETradingServersManagerRoutes } from '../../../../modules/router/defs';
import { CreateComponent, CreateComponentFormValues } from './view';

export type TConnectedCreateComponentProps = {
    configType?: EComponentConfigType;
};

export function ConnectedCreateComponent(props: TConnectedCreateComponentProps): ReactElement {
    const { createConfig } = useModule(ModuleBaseActions);
    const { deleteTab } = useModule(ModuleLayouts);
    const { navigate, getState } = useModule(ModuleRouter);

    const cbSubmit = useFunction(async (values: CreateComponentFormValues) => {
        const { configType, config, name, kind } = values;
        // Submit component to backend
        const { id } = await firstValueFrom(createConfig(configType, config, name, kind));

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

    return <CreateComponent {...props} onSubmit={cbSubmit} />;
}
