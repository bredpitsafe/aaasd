import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { cnLink } from '@frontend/common/src/components/Link/index.css.ts';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { isNil } from 'lodash-es';
import type { MouseEvent } from 'react';
import { memo } from 'react';

import { EDefaultLayoutComponents } from '../layouts/default.tsx';
import { ModuleTradingServersManagerRouter } from '../modules/router/module.ts';
import { useShowInstrumentsDetails } from './hooks/useShowInstrumentsDetails.ts';

export const WidgetInstrumentNameRenderer = memo(
    ({ value, data }: ICellRendererParams<string, TInstrument>) => {
        const { buildUrl, getState } = useModule(ModuleTradingServersManagerRouter);
        const showInstrumentsDetails = useShowInstrumentsDetails();

        const showDetails = useFunction((event: MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();

            if (isNil(showInstrumentsDetails) || isNil(data)) {
                return;
            }

            void showInstrumentsDetails([data]);
        });

        if (isNil(showInstrumentsDetails) || isNil(data)) {
            return <>{value}</>;
        }

        const { route } = getState();

        const url = buildUrl(route.name, {
            ...route.params,
            instruments: [data.id],
            tab: EDefaultLayoutComponents.InstrumentDetails,
        });

        return (
            <a className={cnLink} href={url} onClick={showDetails}>
                {value}
            </a>
        );
    },
);
