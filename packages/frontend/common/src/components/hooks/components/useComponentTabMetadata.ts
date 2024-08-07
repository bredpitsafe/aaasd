import { has, isEqual, isNil, omit } from 'lodash-es';
import { useMemo } from 'react';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { useModule } from '../../../di/react';
import type { ComponentMetadataType } from '../../../modules/componentMetadata';
import { ModuleComponentMetadata } from '../../../modules/componentMetadata';
import type { ComponentTabKey } from '../../../types/componentMetadata';
import type { EComponentType, TComponentId } from '../../../types/domain/component';
import { useFunction } from '../../../utils/React/useFunction';

type RecordValue<TComponentData extends Record<ComponentTabKey, unknown>> =
    TComponentData extends Record<ComponentTabKey, infer TRecordValue> ? TRecordValue : never;

export type TComponentTabMetadata<T> = [(value?: T) => void, () => T | undefined, Observable<T>];

export function useComponentTabMetadata<TComponentData extends Record<ComponentTabKey, unknown>>(
    componentMetadataType: ComponentMetadataType,
    componentType: EComponentType,
    componentId: TComponentId,
    componentTabKey: ComponentTabKey,
): TComponentTabMetadata<RecordValue<TComponentData>> {
    const { setComponentMetadata, getComponentMetadata, getComponentMetadata$ } =
        useModule(ModuleComponentMetadata);

    const setValue = useFunction((value?: RecordValue<TComponentData>) =>
        setComponentMetadata<TComponentData>(
            componentMetadataType,
            componentType,
            componentId,
            (prev) => {
                if (isNil(value)) {
                    return !isNil(prev) && has(prev, componentTabKey)
                        ? (omit(prev, componentTabKey) as TComponentData)
                        : prev;
                }

                return isNil(prev) || !isEqual(prev[componentTabKey], value)
                    ? ({
                          ...prev,
                          [componentTabKey]: value,
                      } as TComponentData)
                    : prev;
            },
        ),
    );

    const getValue = useFunction(
        () =>
            getComponentMetadata<Record<ComponentTabKey, RecordValue<TComponentData>>>(
                componentMetadataType,
                componentType,
                componentId,
            )?.[componentTabKey],
    );

    const value$ = useMemo(
        () =>
            getComponentMetadata$<Record<ComponentTabKey, RecordValue<TComponentData>>>(
                componentMetadataType,
                componentType,
                componentId,
            ).pipe(map((metadata) => metadata?.[componentTabKey] as RecordValue<TComponentData>)),
        [getComponentMetadata$, componentMetadataType, componentType, componentId, componentTabKey],
    );

    return [setValue, getValue, value$];
}
