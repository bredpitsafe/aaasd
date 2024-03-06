import { useModule } from '@frontend/common/src/di/react';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { logger } from '@frontend/common/src/utils/Tracing';
import { firstValueFrom } from 'rxjs';

import { ModuleDashboardActions } from '../../modules/actions';
import type { TPanelXMLConfigWithoutLayout } from '../../types/panel';
import { convertXMLToPanel } from '../../utils/panels/converters';

export function useImportPanel(): (
    panelXml: TPanelXMLConfigWithoutLayout,
    relWidth: number,
    relHeight: number,
) => Promise<void> {
    const { showError } = useModule(ModuleBaseActions);
    const { clonePanel } = useModule(ModuleDashboardActions);

    return useFunction(
        async (
            panelXml: TPanelXMLConfigWithoutLayout,
            relWidth: number,
            relHeight: number,
        ): Promise<void> => {
            try {
                await firstValueFrom(
                    clonePanel(
                        generateTraceId(),
                        await convertXMLToPanel(panelXml),
                        relWidth,
                        relHeight,
                    ),
                );
            } catch (err) {
                showError(err as Error);
                logger.error(err as Error);
            }
        },
    );
}
