import { SaveOutlined } from '@ant-design/icons';
import { isUndefined } from 'lodash-es';
import type { ComponentProps } from 'react';
import { memo, useMemo } from 'react';

import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '../../../e2e/selectors/main-menu.modal.selectors.ts';
import { Button } from '../../components/Button';
import { Dropdown } from '../../components/Dropdown.tsx';
import type { MenuProps } from '../../components/Menu.tsx';
import { useModule } from '../../di/react';
import { ModuleLayouts } from '../../modules/layouts';
import type { TWithClassname } from '../../types/components';
import { EMPTY_ARRAY } from '../../utils/const.ts';
import { useFunction } from '../../utils/React/useFunction.ts';
import { useSyncObservable } from '../../utils/React/useSyncObservable';

type TProps = TWithClassname & {
    size: ComponentProps<typeof Button>['size'];
    type: 'icon-label' | 'icon';
};

const KEY_SAVE_ALL = 'all';

export const LayoutDraftSaver = memo(({ className, size, type }: TProps) => {
    const { hasDraft$, saveDraft, layoutsWithDraft$ } = useModule(ModuleLayouts);
    const hasDraft = useSyncObservable(hasDraft$);
    const layoutsWithDraft = useSyncObservable(layoutsWithDraft$);

    const items: MenuProps['items'] = useMemo(() => {
        return [
            {
                key: KEY_SAVE_ALL,
                label: 'Save All',
                icon: <SaveOutlined />,
            },
            { type: 'divider' },
            ...(layoutsWithDraft ?? EMPTY_ARRAY).map((layoutId) => ({
                key: layoutId,
                label: layoutId,
            })),
        ] as MenuProps['items'];
    }, [layoutsWithDraft]);

    const handleItemClick: MenuProps['onClick'] = useFunction((e) => {
        switch (e.key) {
            case KEY_SAVE_ALL: {
                return saveDraft();
            }
            default: {
                return saveDraft(e.key);
            }
        }
    });

    if (isUndefined(hasDraft) || hasDraft === false) return null;
    return (
        <Dropdown menu={{ items, onClick: handleItemClick }}>
            <Button
                {...EMainMenuProps[EMainMenuModalSelectors.SaveLayoutButton]}
                className={className}
                size={size}
                icon={<SaveOutlined />}
            >
                {type === 'icon' ? null : 'Save Layout Draft'}
            </Button>
        </Dropdown>
    );
});
