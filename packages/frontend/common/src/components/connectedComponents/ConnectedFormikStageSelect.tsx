import { useField } from 'formik';
import { useMemo } from 'react';

import { buildStage } from '../../hooks/useStages.ts';
import type { TSocketName } from '../../types/domain/sockets';
import { getProductionSocketsList } from '../../utils/url.ts';
import { ConnectedStageSwitch } from './ConnectedStageSwitch';

type TProps = {
    name: string;
};

export function ConnectedFormikStageSelect({ name }: TProps) {
    const [{ value }, , { setValue }] = useField<TSocketName>(name);
    const active = useMemo(() => buildStage(value, getProductionSocketsList()), [value]);

    return (
        <ConnectedStageSwitch
            size="middle"
            type="icon-label"
            active={active}
            onChangeSocket={setValue}
        />
    );
}
