import { useUrlFilter } from '@frontend/common/src/components/AgTable/helpers/useUrlFilter';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { useEffect, useRef } from 'react';

import type { TInstrumentsFilterModel } from '../columns';
import { STATUS_FILTER_OPTIONS } from '../columns';

export const useStatusFilter = () => {
    const {
        value: values,
        state,
        updateFilter,
    } = useUrlFilter<TInstrumentsFilterModel>(ETableIds.AllInstruments, 'status');
    const paramsInitedRef = useRef(false);

    const selectedStatuses = values as TInstrumentsFilterModel['status']['values'] | undefined;

    const selectedStatusesNotInitedYet = paramsInitedRef.current === false;

    useEffect(
        function excludeDelistedStatusOnFirstLoad() {
            if (state && !paramsInitedRef.current) {
                paramsInitedRef.current = true;

                updateFilter({
                    status: {
                        values: (selectedStatuses || STATUS_FILTER_OPTIONS).filter(
                            (option) => option !== 'Delisted',
                        ),
                        filterType: 'set',
                    },
                });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [state],
    );

    return { selectedStatuses, selectedStatusesNotInitedYet };
};
