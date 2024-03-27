import { orange } from '@ant-design/colors';
import { BlockOutlined } from '@ant-design/icons';
import {
    BalanceMonitorProps,
    EBalanceMonitorSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/balance-monitor.page.selectors';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { Badge } from '@frontend/common/src/components/Badge';
import { Button } from '@frontend/common/src/components/Button';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { ERuleActualStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isSyncDesc, UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import cn from 'classnames';
import { memo, useMemo } from 'react';

import { ModuleTransferBlockingRules } from '../../modules/observables/ModuleTransferBlockingRules';
import { cnBadgeCount, cnFloatButtonNoMargin, cnFullWidth } from './view.css';

const TITLE = 'Transfer Blocking Rules';

export const TransferBlockingRulesButton = memo(
    ({ selected, type }: { selected: boolean; type: ENavType }) => {
        const { getTransferBlockingRules$ } = useModule(ModuleTransferBlockingRules);

        const traceId = useTraceId();

        const transferBlockingRules = useSyncObservable(
            getTransferBlockingRules$(traceId),
            useMemo(() => UnscDesc(null), []),
        );

        const activeTransferBlockingRulesCount = useMemo(
            () =>
                isSyncDesc(transferBlockingRules)
                    ? transferBlockingRules.value.reduce(
                          (acc, { actualStatus, showAlert }) =>
                              actualStatus === ERuleActualStatus.Active && showAlert
                                  ? acc + 1
                                  : acc,
                          0,
                      )
                    : undefined,
            [transferBlockingRules],
        );

        return (
            <Badge
                className={cn(cnBadgeCount, cnFullWidth)}
                color={orange[5]}
                count={activeTransferBlockingRulesCount}
            >
                {type === ENavType.Hidden ? (
                    <FloatButton
                        className={cnFloatButtonNoMargin}
                        tooltip={TITLE}
                        icon={<BlockOutlined />}
                        type={selected ? 'primary' : 'default'}
                    />
                ) : (
                    <Button
                        {...BalanceMonitorProps[
                            EBalanceMonitorSelectors.TransferBlockingRulesButton
                        ]}
                        className={cnFullWidth}
                        title={TITLE}
                        icon={<BlockOutlined />}
                        type={selected ? 'primary' : 'default'}
                    >
                        {type === ENavType.Full ? TITLE : undefined}
                    </Button>
                )}
            </Badge>
        );
    },
);
