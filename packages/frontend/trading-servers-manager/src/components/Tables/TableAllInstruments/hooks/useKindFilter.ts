import { useUrlFilter } from '@frontend/common/src/components/Table/helpers/useUrlFilter';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { EInstrumentKindType } from '@frontend/common/src/types/domain/instrument';

import { TInstrumentsFilterModel } from '../columns';

export const useKindFilter = () => {
    const { value: values } = useUrlFilter<TInstrumentsFilterModel>(
        ETableIds.AllInstruments,
        'kind',
    );

    return {
        selectedKinds: values as EInstrumentKindType[],
    };
};
