import { Col, Row } from '@frontend/common/src/components/Grid';
import {
    cnButtonPosition,
    cnLabel,
} from '@frontend/common/src/components/Settings/components/view.css';
import { StageSelect, TStage } from '@frontend/common/src/components/StageSelect/StageSelect';
import { useModule } from '@frontend/common/src/di/react';
import { ESocketType, TSocketName } from '@frontend/common/src/types/domain/sockets';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { getProductionSocketsList } from '@frontend/common/src/utils/url';
import { cnSelector } from '@frontend/dashboard/src/components/Settings/ServiceStageName/index.css.ts';
import { memo, useMemo } from 'react';

import { ModuleBFF } from '../../../modules/bff';
import { useBFFStageName } from '../hooks/useBFFStageName.ts';

export const BFFStageName = memo(() => {
    const { bffSocketsList$ } = useModule(ModuleBFF);
    const [socketName, setSocketName] = useBFFStageName();
    const stageNames = useSyncObservable(bffSocketsList$);

    const prodStages = useMemo(() => getProductionSocketsList(), []);
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
                    className={cnSelector}
                    onStageChange={setSocketName}
                    favoriteStages={EMPTY_ARRAY}
                    rarelyUsedStages={stages ?? EMPTY_ARRAY}
                    active={
                        socketName ? { name: socketName, tag: ESocketType.Development } : undefined
                    }
                    size="middle"
                    type="icon-label"
                />
            </Col>
        </Row>
    );
});
