import type { ColDef } from '@frontend/ag-grid';
import {
    ETooltipTheme,
    TooltipTable,
} from '@frontend/common/src/components/TooltipTable/TooltipTable.tsx';
import type { TInstrument, TProviderMeta } from '@frontend/common/src/types/domain/instrument';
import { isNil } from 'lodash-es';
import { type ReactElement, useMemo } from 'react';

import { cnProviderMetaTooltip } from './ProviderMetaFieldView.css';

const columns: ColDef<{ provider: string; meta: string }>[] = [
    {
        field: 'provider',
        headerName: 'Provider',
        maxWidth: 140,
        minWidth: 90,
    },
    {
        field: 'meta',
        headerName: 'Meta',
        minWidth: 380,
    },
];

type TProviderMetaFieldViewProps = { data: TInstrument; theme?: ETooltipTheme };

export function ProviderMetaFieldView({
    data,
    theme = ETooltipTheme.Dark,
}: TProviderMetaFieldViewProps): ReactElement | null {
    if (data.providerMeta.length === 0) {
        return null;
    }

    return <ProviderMetaTooltipTable items={data.providerMeta} theme={theme} />;
}

function ProviderMetaTooltipTable({
    items,
    theme,
}: {
    items: TProviderMeta[];
    theme: ETooltipTheme;
}): ReactElement {
    const providers = useMemo(() => {
        const sortedProviders = items.map((element) => element?.provider).sort();
        return sortedProviders.join(', ');
    }, [items]);

    const formattedDataWithMeta = useMemo(() => {
        return items.map((providerWIthMeta) => ({
            provider: providerWIthMeta.provider,
            meta: isNil(providerWIthMeta.meta) ? '' : JSON.stringify(providerWIthMeta.meta),
        }));
    }, [items]);

    return (
        <TooltipTable
            items={formattedDataWithMeta}
            placement="right"
            theme={theme}
            content={providers}
            columns={columns}
            rowKey="provider"
            className={cnProviderMetaTooltip}
        />
    );
}
