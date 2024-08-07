import { isEmpty, isEqual, isFunction, isNil, omit } from 'lodash-es';
import memoize from 'memoizee';
import type { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import type { EComponentType, TComponentId } from '../../types/domain/component';
import { createObservableBox } from '../../utils/rx';
import { ComponentMetadataType } from './index';

const boxComponentMetadata = createObservableBox<
    Partial<Record<ComponentMetadataType, Record<string, unknown>>>
>({});

export function createComponentKey(
    componentType: EComponentType,
    componentId: TComponentId,
): string {
    return `${componentType}:${componentId}`;
}

export const getComponentMetadataByType$ = memoize(
    (type: ComponentMetadataType): Observable<Record<string, unknown> | undefined> =>
        boxComponentMetadata.obs.pipe(
            map((metadata) => metadata[type]),
            distinctUntilChanged(),
        ),
    { primitive: true, max: 100 },
);

export const getComponentMetadata$ = memoize(
    <T>(
        type: ComponentMetadataType,
        componentType: EComponentType,
        componentId: TComponentId,
    ): Observable<T | undefined> =>
        getComponentMetadataByType$(type).pipe(
            map(
                (metadata) =>
                    metadata?.[createComponentKey(componentType, componentId)] as T | undefined,
            ),
            distinctUntilChanged(),
        ),
    { primitive: true, max: 100 },
);

export const getComponentsMetadata$ = memoize(
    <T>(
        type: ComponentMetadataType,
        components: { id: TComponentId; type: EComponentType }[],
    ): Observable<{ id: TComponentId; type: EComponentType; meta: T | undefined }[]> =>
        getComponentMetadataByType$(type).pipe(
            map((metadata) =>
                components.map(({ id, type }) => ({
                    id,
                    type,
                    meta: metadata?.[createComponentKey(type, id)] as T | undefined,
                })),
            ),
            distinctUntilChanged(isEqual),
        ),
    { max: 100 },
);

export function getComponentMetadata<T>(
    type: ComponentMetadataType,
    componentType: EComponentType,
    componentId: TComponentId,
): T | undefined {
    return boxComponentMetadata.get()[type]?.[createComponentKey(componentType, componentId)] as
        | T
        | undefined;
}

export function setComponentMetadata<T>(
    type: ComponentMetadataType,
    componentType: EComponentType,
    componentId: TComponentId,
    value: T | ((value?: T) => T | undefined),
): void {
    const componentKey = createComponentKey(componentType, componentId);

    boxComponentMetadata.set((prev) => ({
        ...prev,
        [type]: {
            ...prev[type],
            [componentKey]: isFunction(value)
                ? value(prev[type]?.[componentKey] as T | undefined)
                : value,
        },
    }));
}

export function deleteComponentMetadata(
    type: ComponentMetadataType,
    componentType: EComponentType,
    componentId: TComponentId,
): void {
    boxComponentMetadata.set((prev) => ({
        ...prev,
        [type]: omit(prev[type], createComponentKey(componentType, componentId)),
    }));
}

export function cleanComponentMetadata(type?: ComponentMetadataType): void {
    if (isNil(type)) {
        boxComponentMetadata.set(() => ({}));
    } else {
        boxComponentMetadata.set((prev) => omit(prev, type));
    }
}

export function configsHasDraft$(): Observable<boolean> {
    return getComponentMetadataByType$(ComponentMetadataType.Drafts).pipe(
        map((configsWithDraft) => {
            if (isEmpty(configsWithDraft)) return false;
            const notEmptyDraft = Object.values(configsWithDraft).find((conf) => !isEmpty(conf));
            return !isNil(notEmptyDraft);
        }),
        distinctUntilChanged(),
    );
}
