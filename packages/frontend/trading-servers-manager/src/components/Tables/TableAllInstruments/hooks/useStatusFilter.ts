import { useUrlFilter } from '@frontend/common/src/components/Table/helpers/useUrlFilter';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { useEffect, useRef } from 'react';

import { STATUS_FILTER_OPTIONS, TInstrumentsFilterModel } from '../columns';

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
