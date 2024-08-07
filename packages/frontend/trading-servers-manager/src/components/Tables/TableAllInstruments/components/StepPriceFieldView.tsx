import type { ColDef } from '@frontend/ag-grid';
import {
    ETooltipTheme,
    TooltipTable,
} from '@frontend/common/src/components/TooltipTable/TooltipTable.tsx';
import type { TInstrument, TStepTableTier } from '@frontend/common/src/types/domain/instrument';
import { EStepRulesName } from '@frontend/common/src/types/domain/instrument';
import { type ReactElement, useMemo } from 'react';

const columns: ColDef<TStepTableTier>[] = [
    {
        field: 'boundary',
        headerName: 'Boundary',
    },
    {
        field: 'step',
        headerName: 'Step',
    },
];

export function StepPriceFieldView({
    data,
    theme = ETooltipTheme.Dark,
}: {
    data: TInstrument;
    theme?: ETooltipTheme;
}): ReactElement {
    if (data.stepPrice.type !== EStepRulesName.Table) {
        return <>{data.stepPrice.value}</>;
    }

    return <StepPriceTooltipTable tiers={data.stepPrice.tiers} theme={theme} />;
}

function StepPriceTooltipTable({
    tiers,
    theme,
}: {
    tiers: TStepTableTier[];
    theme: ETooltipTheme;
}): ReactElement {
    const interval = useMemo(() => {
        const sortedSteps = [...tiers].sort((a, b) => a.step - b.step);
        return sortedSteps.length > 0
            ? `${sortedSteps[0].step} — ${sortedSteps[sortedSteps.length - 1].step}`
            : '—';
    }, [tiers]);

    return (
        <TooltipTable
            items={tiers}
            placement="right"
            theme={theme}
            content={interval}
            columns={columns}
            rowKey="boundary"
        />
    );
}
