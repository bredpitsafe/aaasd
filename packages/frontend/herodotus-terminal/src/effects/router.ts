import { generateTraceId } from '@common/utils';
import type { TContextRef } from '@frontend/common/src/di';
import { syncSocketWithURL } from '@frontend/common/src/effects/router';
import { ModuleSubscribeToCurrentComponentsSnapshot } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToCurrentComponentsSnapshot.ts';
import { isHerodotus } from '@frontend/common/src/utils/domain/isHerodotus.ts';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isNil } from 'lodash-es';
import { map } from 'rxjs';

import { EHerodotusTerminalRoutes } from '../modules/router/def';
import { ModuleHerodotusTerminalRouter } from '../modules/router/module';

export function routerEffects(ctx: TContextRef): void {
    initViewRouter(ctx);
    syncSocketWithURL(ctx, EHerodotusTerminalRoutes.Default);
}

function initViewRouter(ctx: TContextRef): void {
    const subscribeToComponents = ModuleSubscribeToCurrentComponentsSnapshot(ctx);
    const { getState, navigate, router } = ModuleHerodotusTerminalRouter(ctx);

    router.start();

    subscribeToComponents(undefined, { traceId: generateTraceId() })
        .pipe(
            extractSyncedValueFromValueDescriptor(),
            map(({ robots }) => robots.filter(isHerodotus)),
        )
        .subscribe((robots) => {
            const state = getState();
            if (isNil(state)) {
                return;
            }

            switch (state.route.name) {
                case EHerodotusTerminalRoutes.Stage: {
                    // Only redirect when there's exactly one robot on the selected server
                    if (robots.length === 1) {
                        void navigate(
                            EHerodotusTerminalRoutes.Robot,
                            {
                                ...state.route.params,
                                robot: robots[0].id,
                            },
                            { replace: true },
                        );
                    }
                }
            }
        });
}
