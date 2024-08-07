import { Col, Row } from '@frontend/common/src/components/Grid';
import {
    cnButtonPosition,
    cnLabel,
} from '@frontend/common/src/components/Settings/components/view.css';
import type { TStage } from '@frontend/common/src/components/StageSelect/StageSelect';
import { StageSelect } from '@frontend/common/src/components/StageSelect/StageSelect';
import { useModule } from '@frontend/common/src/di/react';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { ESocketType } from '@frontend/common/src/types/domain/sockets';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { getProductionSocketsList } from '@frontend/common/src/utils/url';
import { cnSelector } from '@frontend/dashboard/src/components/Settings/ServiceStageName/index.css.ts';
import { memo, useMemo } from 'react';

import { EModalProps, EModalSelectors } from '../../../../e2e/selectors/modal.selectors';
import { ModuleBFF } from '../../../modules/bff';
import { isProductionDomain } from '../../../utils/environment.ts';
import { useBFFStageName } from '../hooks/useBFFStageName.ts';

export const BFFStageName = memo(() => {
    const { bffSocketsList$ } = useModule(ModuleBFF);
    const [socketName, setSocketName] = useBFFStageName();
    const stageNames = useSyncObservable(bffSocketsList$);

    const prodStages = useMemo(() => getProductionSocketsList(), []);

    /* If this is a prod domain, selecting BFF stage is not permitted.
       For legacy reasons, leave this selector here, but disable it */
    const isProdDomain = useMemo(() => isProductionDomain(), []);
    const stages = useMemo(
        () =>
            Object.keys(stageNames ?? {}).map(
                (name) =>
                    ({
                        name,
                        tag: prodStages.includes(name as TSocketName)
                            ? ESocketType.Production
                            : ESocketType.Development,
                    }) as TStage,
            ),
        [stageNames, prodStages],
    );

    return (
        <Row gutter={[8, 16]}>
            <Col className={cnLabel} span={6}>
                BFF Stage
            </Col>
            <Col flex="auto" className={cnButtonPosition}>
                <StageSelect
                    {...EModalProps[EModalSelectors.BFFStageSelector]}
                    className={cnSelector}
                    onStageChange={setSocketName}
                    favoriteStages={EMPTY_ARRAY}
                    rarelyUsedStages={stages ?? EMPTY_ARRAY}
                    active={
                        socketName ? { name: socketName, tag: ESocketType.Development } : undefined
                    }
                    size="middle"
                    type="icon-label"
                    disabled={isProdDomain}
                />
            </Col>
        </Row>
    );
});
