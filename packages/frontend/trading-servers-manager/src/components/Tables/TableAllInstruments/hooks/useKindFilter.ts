import { useUrlFilter } from '@frontend/common/src/components/AgTable/helpers/useUrlFilter';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { EInstrumentKindType } from '@frontend/common/src/types/domain/instrument';

import type { TInstrumentsFilterModel } from '../columns';

export const useKindFilter = () => {
    const { value: values } = useUrlFilter<TInstrumentsFilterModel>(
        ETableIds.AllInstruments,
        'kind',
    );

    return {
        selectedKinds: values as EInstrumentKindType[],
    };
};
