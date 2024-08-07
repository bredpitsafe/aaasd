import { SaveOutlined } from '@ant-design/icons';
import { useModule } from '@frontend/common/src/di/react';
import {
    ComponentMetadataType,
    ModuleComponentMetadata,
} from '@frontend/common/src/modules/componentMetadata';
import type { TLayoutId } from '@frontend/common/src/modules/layouts/data';
import type {
    IDraftValueWithDigest,
    TComponentDrafts,
} from '@frontend/common/src/types/componentMetadata';
import { ComponentTabKey } from '@frontend/common/src/types/componentMetadata';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import type { TabNode } from 'flexlayout-react';
import { isEmpty, isNil } from 'lodash-es';
import type { ReactNode } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { EMPTY } from 'rxjs';

import { ELayoutIds } from '../layouts';
import { EPageGatesLayoutComponents } from '../layouts/gate';
import { EPageRobotsLayoutComponents } from '../layouts/robot';
import { cnDirtyTabIcon } from '../layouts/style.css';
import { useCurrentGate } from './gate.ts';
import { useCurrentRobot } from './robot.ts';

export function useLayoutTitleFactory(
    layoutId: TLayoutId | undefined,
): ((node: TabNode) => ReactNode) | undefined {
    const { getComponentMetadata$ } = useModule(ModuleComponentMetadata);

    const gate = useCurrentGate();
    const robot = useCurrentRobot();

    const currentDraftStatus = useSyncObservable(
        useMemo(
            () =>
                !isNil(gate.value)
                    ? getComponentMetadata$<TComponentDrafts<IDraftValueWithDigest>>(
                          ComponentMetadataType.Drafts,
                          gate.value.type,
                          gate.value.id,
                      )
                    : !isNil(robot.value)
                      ? getComponentMetadata$<TComponentDrafts<IDraftValueWithDigest>>(
                            ComponentMetadataType.Drafts,
                            EComponentType.robot,
                            robot.value.id,
                        )
                      : EMPTY,
            [getComponentMetadata$, gate, robot],
        ),
    );

    return useCallback(
        (node: TabNode) => {
            const component = node.getComponent();
            const name = node.getName();

            if (isNil(layoutId)) {
                return name;
            }

            if (layoutId === ELayoutIds.PageGates) {
                switch (component) {
                    case EPageGatesLayoutComponents.Config:
                        return (
                            <TabTitleWithStatus
                                isDirty={!isEmpty(currentDraftStatus?.[ComponentTabKey.Config])}
                                name={name}
                            />
                        );
                    case EPageGatesLayoutComponents.CustomView:
                        return (
                            <TabTitleWithStatus
                                isDirty={!isEmpty(currentDraftStatus?.[ComponentTabKey.CustomView])}
                                name={name}
                            />
                        );
                }
            }

            if (
                layoutId == ELayoutIds.PageHerodotus ||
                layoutId.startsWith(ELayoutIds.PageRobots)
            ) {
                switch (component) {
                    case EPageRobotsLayoutComponents.State:
                        return (
                            <TabTitleWithStatus
                                isDirty={!isEmpty(currentDraftStatus?.[ComponentTabKey.State])}
                                name={name}
                            />
                        );
                    case EPageRobotsLayoutComponents.Config:
                        return (
                            <TabTitleWithStatus
                                isDirty={!isEmpty(currentDraftStatus?.[ComponentTabKey.Config])}
                                name={name}
                            />
                        );
                    case EPageRobotsLayoutComponents.CustomView:
                        return (
                            <TabTitleWithStatus
                                isDirty={!isEmpty(currentDraftStatus?.[ComponentTabKey.CustomView])}
                                name={name}
                            />
                        );
                }
            }

            return name;
        },
        [layoutId, currentDraftStatus],
    );
}

const TabTitleWithStatus = memo(({ isDirty, name }: { isDirty: boolean; name: string }) =>
    isDirty ? (
        <span>
            <SaveOutlined className={cnDirtyTabIcon} />
            {name}
        </span>
    ) : (
        <>{name}</>
    ),
);
