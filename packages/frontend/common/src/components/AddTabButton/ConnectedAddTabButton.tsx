import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { useModule } from '../../di/react';
import { ModuleLayouts } from '../../modules/layouts';
import { useFunction } from '../../utils/React/useFunction';
import { useSyncObservable } from '../../utils/React/useSyncObservable';
import type { ButtonProps } from '../Button';
import { AddTabButton } from './AddTabButton';

export type TConnectedAddTabButtonProps = Omit<ButtonProps, 'onClick'> & {
    components: string[];
};

export function ConnectedAddTabButton(props: TConnectedAddTabButtonProps): ReactElement {
    const { components, ...restProps } = props;
    const { model$, upsertTab } = useModule(ModuleLayouts);
    const model = useSyncObservable(model$);

    const cbClick = useFunction((id: string) => {
        void upsertTab(id, { select: true });
    });

    const filteredComponents = useMemo(
        () => components.filter((id) => (model ? isNil(model.getNodeById(id)) : false)),
        [model, components],
    );

    return <AddTabButton components={filteredComponents} onClick={cbClick} {...restProps} />;
}
