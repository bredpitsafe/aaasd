import type { NodeMouseEvent } from 'flexlayout-react';

import { useModule } from '../../di/react.tsx';
import { ModuleLayouts } from '../../modules/layouts';
import { isTabNode } from '../../modules/layouts/utils.ts';
import { EMouseButton } from '../../types/mouse.ts';
import { useFunction } from '../../utils/React/useFunction.ts';

export const useTabMouseActions = () => {
    const { deleteTab, deleteOtherTabs } = useModule(ModuleLayouts);

    return useFunction<NodeMouseEvent>((node, event) => {
        if (isTabNode(node)) {
            switch (event.button) {
                case EMouseButton.Middle: {
                    const id = node.getId();
                    if (event.ctrlKey || event.metaKey) {
                        // Ctrl/Meta + Click deletes other tabs in this tabset
                        // Ctrl/Meta + Shift + Click deletes all other tabs
                        deleteOtherTabs(id, !event.shiftKey);
                    } else {
                        // Click w/o modifiers deletes only this tab
                        deleteTab(id);
                    }
                    break;
                }
            }
        }
    });
};
