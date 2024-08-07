import { InfoCircleOutlined } from '@ant-design/icons';
import type { TPrimitive } from '@common/types';
import type { TColDef } from '@frontend/ag-grid/src/types.ts';
import { Button } from '@frontend/common/src/components/Button.tsx';
import {
    ETooltipTheme,
    TooltipTable,
} from '@frontend/common/src/components/TooltipTable/TooltipTable.tsx';
import type { TScope } from '@frontend/common/src/types/domain/dashboardsStorage.ts';
import { useMemo } from 'react';

type TDashboardScopeProps = {
    scope: TScope;
};

type TData = {
    key: string;
    value: TPrimitive;
};

const columns: TColDef<TData>[] = [
    {
        field: 'key',
    },
    {
        field: 'value',
    },
];

export const DashboardScopeInfo = ({ scope }: TDashboardScopeProps) => {
    const data: TData[] = useMemo(() => {
        return Object.entries(scope).map(([key, value]) => ({ key, value }));
    }, [scope]);

    return (
        <TooltipTable
            columns={columns}
            content={<Button title="Scope params" icon={<InfoCircleOutlined />} shape="circle" />}
            items={data}
            rowKey="key"
            theme={ETooltipTheme.Dark}
            trigger="click"
        />
    );
};
