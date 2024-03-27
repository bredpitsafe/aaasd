import { useModule } from '@frontend/common/src/di/react';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { from, switchMap } from 'rxjs';

import { ModuleClonePanel } from '../../modules/actions/dashboards/clonePanel.ts';
import type { TPanelXMLConfigWithoutLayout } from '../../types/panel';
import { convertXMLToPanel } from '../../utils/panels/converters.ts';

export function useImportPanel(): (
    panelXml: TPanelXMLConfigWithoutLayout,
    relWidth: number,
    relHeight: number,
) => Promise<boolean> {
    const clonePanel = useModule(ModuleClonePanel);
    const [importPanel] = useNotifiedObservableFunction(
        (panelXml: TPanelXMLConfigWithoutLayout, relWidth: number, relHeight: number) => {
            return from(convertXMLToPanel(panelXml)).pipe(
                switchMap((panel) =>
                    clonePanel({ panel, relWidth, relHeight }, { traceId: generateTraceId() }),
                ),
            );
        },
    );

    return importPanel;
}
