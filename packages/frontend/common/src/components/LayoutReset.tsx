import { RollbackOutlined } from '@ant-design/icons';
import type { ComponentProps } from 'react';
import { memo } from 'react';

import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '../../e2e/selectors/main-menu.modal.selectors';
import type { TWithClassname } from '../types/components';
import { isMac } from '../utils/detect';
import { useFunction } from '../utils/React/useFunction';
import { Button } from './Button';

const TITLE_TEXT = `Click to reset to default layout\n${
    isMac ? '⌘' : 'Ctrl'
}+Click to reset to saved layout`;

type TProps = TWithClassname & {
    onResetToDefault: () => void;
    onResetToSaved: () => void;
    size: ComponentProps<typeof Button>['size'];
    type: 'icon-label' | 'icon';
};

export const LayoutReset = memo(
    ({ className, size, type, onResetToDefault, onResetToSaved }: TProps) => {
        const resetLayout = useFunction((e: { ctrlKey: boolean; metaKey: boolean }) => {
            const withCtrl = e.ctrlKey || e.metaKey;

            if (withCtrl) {
                onResetToSaved();
            } else {
                onResetToDefault();
            }
        });
        return (
            <Button
                {...EMainMenuProps[EMainMenuModalSelectors.ResetLayoutButton]}
                className={className}
                size={size}
                title={TITLE_TEXT}
                icon={<RollbackOutlined />}
                onClick={resetLayout}
            >
                {type === 'icon' ? null : 'Reset Layout'}
            </Button>
        );
    },
);
