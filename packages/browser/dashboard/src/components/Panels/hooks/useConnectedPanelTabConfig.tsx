import { AlignLeftOutlined } from '@ant-design/icons';
import { useTabEditorState } from '@frontend/common/src/components/Editors/hooks/useTabEditorState';
import {
    EConfigEditorLanguages,
    EConfigEditorSchema,
} from '@frontend/common/src/components/Editors/types';
import { Suspense } from '@frontend/common/src/components/Suspense';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { isFail } from '@frontend/common/src/types/Fail';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { noop } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { lazily } from 'react-lazily';
import { firstValueFrom } from 'rxjs';

import { ModuleDashboardActions } from '../../../modules/actions';
import { ModuleCustomView } from '../../../modules/customView/module';
import type { TPanel, TPanelXMLConfigWithoutLayout } from '../../../types/panel';
import { isCustomViewGridPanel, isCustomViewTablePanel } from '../../../types/panel/guards';
import {
    convertPanelToEditConfigPanelXml,
    convertPanelToExportablePanelEditorSimplified,
    convertXMLToPanel,
} from '../../../utils/panels/converters';
import { ConvertError } from '../../../utils/panels/errors';
import { useEditorCompletionSchema } from '../../hooks/useEditorCompletionSchema';
import type { TPanelTab } from '../../Panel/view';
import { cnConfigEditor } from './useConnectedPanelTabConfig.css';

const { ConfigFullEditor } = lazily(
    () => import('@frontend/common/src/components/Editors/ConfigFullEditor'),
);

export function useConnectedPanelTabConfig(panel: TPanel): TPanelTab | undefined {
    const { showError } = useModule(ModuleBaseActions);
    const { updatePanel } = useModule(ModuleDashboardActions);
    const { getCustomViewGrid, getCustomViewTable } = useModule(ModuleCustomView);

    const { viewMode, changeViewMode } = useTabEditorState({
        key: panel.panelId,
    });

    const changeConfig = useCallback(
        async (source: string): Promise<void> => {
            try {
                const panelContent = await convertXMLToPanel(
                    source as TPanelXMLConfigWithoutLayout,
                );

                const newPanel: TPanel = { ...panel, ...panelContent, panelId: panel.panelId };

                if (isCustomViewGridPanel(newPanel)) {
                    const result = await firstValueFrom(
                        getCustomViewGrid(newPanel.grid, newPanel.settings),
                    );
                    if (isFail(result) && result.code === '[custom-view]: Parse Error') {
                        showError(new ConvertError('Grid compilation failed', result.meta));
                        return;
                    }
                }
                if (isCustomViewTablePanel(newPanel)) {
                    const result = await firstValueFrom(
                        getCustomViewTable(newPanel.table, newPanel.settings),
                    );
                    if (isFail(result) && result.code === '[custom-view]: Parse Error') {
                        showError(new ConvertError('Table compilation failed', result.meta));
                        return;
                    }
                }

                await firstValueFrom(updatePanel(generateTraceId(), newPanel));
            } catch (err) {
                showError(err);
            }
        },
        [getCustomViewGrid, getCustomViewTable, panel, showError, updatePanel],
    );

    const config = useMemo(
        () =>
            convertPanelToEditConfigPanelXml(convertPanelToExportablePanelEditorSimplified(panel)),
        [panel],
    );

    const { value: schema } = useEditorCompletionSchema(EConfigEditorSchema.panel);

    return {
        name: 'Config',
        icon: <AlignLeftOutlined />,
        child: (
            <Suspense>
                <ConfigFullEditor
                    key={panel.panelId}
                    className={cnConfigEditor}
                    language={EConfigEditorLanguages.xml}
                    schema={schema}
                    value={config}
                    viewMode={viewMode}
                    onChangeViewMode={changeViewMode}
                    onApply={changeConfig}
                    onDiscard={noop}
                    originalTitle="Saved panel config"
                    modifiedTitle="Edited panel config"
                />
            </Suspense>
        ),
    };
}
