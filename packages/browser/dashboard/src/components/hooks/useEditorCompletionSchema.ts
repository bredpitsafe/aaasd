import { EConfigEditorSchema } from '@frontend/common/src/components/Editors/types';
import type { SchemaObject } from 'ajv';
import { useAsync } from 'react-use';

export function useEditorCompletionSchema(schema: EConfigEditorSchema): {
    loading: boolean;
    error?: Error;
    value?: SchemaObject;
} {
    return useAsync(async () => {
        switch (schema) {
            case EConfigEditorSchema.dashboard: {
                return import('../../schemas/generated/DashboardXML.json');
            }
            case EConfigEditorSchema.panel: {
                return import('../../schemas/generated/PanelXML.json');
            }
        }
    }, [schema]);
}
