import { EModalProps, EModalSelectors } from '@frontend/common/e2e/selectors/modal.selectors';
import { Col, Row } from '@frontend/common/src/components/Grid';
import {
    cnButtonPosition,
    cnLabel,
} from '@frontend/common/src/components/Settings/components/view.css';
import type { TStage } from '@frontend/common/src/components/StageSelect/StageSelect';
import { StageSelect } from '@frontend/common/src/components/StageSelect/StageSelect';
import { useModule } from '@frontend/common/src/di/react';
import { ESocketType } from '@frontend/common/src/types/domain/sockets';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { getProductionSocketsList } from '@frontend/common/src/utils/url';
import { memo, useMemo } from 'react';

import { ModuleServiceStage } from '../../../modules/serviceStage';
import { useServiceStageName } from '../hooks/useServiceStageName';
import { cnSelector } from './index.css';

export const ServiceStageName = memo(() => {
    const { stageNames$ } = useModule(ModuleServiceStage);
    const [socketName, setSocketName, , loading] = useServiceStageName();
    const stageNames = useSyncObservable(stageNames$);

    const prodStages = useMemo(() => getProductionSocketsList(), []);
    const stages = useMemo(
        () =>
            stageNames?.map(
                (name) =>
                    ({
                        name,
                        tag: prodStages.includes(name)
                            ? ESocketType.Production
                            : ESocketType.Development,
                    }) as TStage,
            ),
        [stageNames, prodStages],
    );

    return (
        <Row gutter={[8, 16]}>
            <Col className={cnLabel} span={6}>
                Service Stage
            </Col>
            <Col flex="auto" className={cnButtonPosition}>
                <StageSelect
                    {...EModalProps[EModalSelectors.ServiceStageSelector]}
                    className={cnSelector}
                    onStageChange={setSocketName}
                    favoriteStages={EMPTY_ARRAY}
                    rarelyUsedStages={stages ?? EMPTY_ARRAY}
                    active={
                        socketName ? { name: socketName, tag: ESocketType.Development } : undefined
                    }
                    size="middle"
                    type="icon-label"
                    loading={loading}
                />
            </Col>
        </Row>
    );
});
