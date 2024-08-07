import type { Nil } from '@common/types';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import { useObservable } from 'react-use';

import { useModule } from '../../../di/react';
import { ComponentMetadataType, ModuleComponentMetadata } from '../../../modules/componentMetadata';
import { createComponentKey } from '../../../modules/componentMetadata/data';
import type { EComponentType, TComponent } from '../../../types/domain/component';
import { EMPTY_ARRAY } from '../../../utils/const';

export function useUpdatingComponentIds<T extends TComponent>(
    componentType: EComponentType,
    list?: Nil | T[],
): T['id'][] {
    const { getComponentMetadataByType$ } = useModule(ModuleComponentMetadata);

    const metadata$ = useMemo(
        () => getComponentMetadataByType$(ComponentMetadataType.Updating),
        [getComponentMetadataByType$],
    );

    const metadata = useObservable(metadata$);

    return useMemo(
        () =>
            isNil(list)
                ? (EMPTY_ARRAY as T['id'][])
                : list
                      .filter((item) => {
                          const key = createComponentKey(componentType, item.id);
                          return metadata?.[key] !== undefined;
                      })
                      .map((item) => item.id),
        [list, componentType, metadata],
    );
}
