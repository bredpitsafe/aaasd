import { SaveOutlined } from '@ant-design/icons';
import { isEmpty, isUndefined } from 'lodash-es';
import { ComponentProps, memo } from 'react';

import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
import { useModule } from '../../di/react';
import { ModuleLayouts } from '../../modules/layouts';
import { TWithClassname } from '../../types/components';
import { useSyncObservable } from '../../utils/React/useSyncObservable';
import { cnList } from './styles.css';

type TProps = TWithClassname & {
    size: ComponentProps<typeof Button>['size'];
    type: 'icon-label' | 'icon';
};

export const LayoutDraftSaver = memo(({ className, size, type }: TProps) => {
    const { hasDraft$, saveDraft, layoutsWithDraft$ } = useModule(ModuleLayouts);
    const hasDraft = useSyncObservable(hasDraft$);
    const layoutsWithDraft = useSyncObservable(layoutsWithDraft$);
    if (isUndefined(hasDraft) || hasDraft === false) return null;
    return (
        <Tooltip
            placement="right"
            title={
                isEmpty(layoutsWithDraft) || isUndefined(layoutsWithDraft) ? undefined : (
                    <div>
                        Save Layout Drafts:
                        <ul className={cnList}>
                            {layoutsWithDraft.map((id) => (
                                <li key={id}>{id}</li>
                            ))}
                        </ul>
                    </div>
                )
            }
        >
            <Button className={className} size={size} icon={<SaveOutlined />} onClick={saveDraft}>
                {type === 'icon' ? null : 'Save Layout Draft'}
            </Button>
        </Tooltip>
    );
});
