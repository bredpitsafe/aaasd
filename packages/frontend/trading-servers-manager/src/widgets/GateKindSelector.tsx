import { Select } from '@frontend/common/src/components/Select';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId.ts';
import { ModuleFetchGateKindsOnCurrentStage } from '@frontend/common/src/modules/actions/nodeGate/ModuleFetchGateKindsOnCurrentStage.ts';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { EComponentConfigType } from '@frontend/common/src/types/domain/component';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    isFailValueDescriptor,
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
    matchValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';

type TSelectProps = ComponentProps<typeof Select>;

export enum EGateType {
    mdGate = EComponentConfigType.mdGate,
    execGate = EComponentConfigType.execGate,
}

type TProps = TWithClassname & {
    value?: string;
    onChange: (name: string) => void;
    size: TSelectProps['size'];
    gateType: EGateType;
};

export function GateKindSelector({ size, value, onChange, className, gateType }: TProps) {
    const dataDesc = useData({ gateType });

    return (
        <Select
            className={className}
            size={size}
            value={value}
            showSearch
            options={isSyncedValueDescriptor(dataDesc) ? dataDesc.value : undefined}
            loading={isLoadingValueDescriptor(dataDesc)}
            status={isFailValueDescriptor(dataDesc) ? 'error' : undefined}
            onChange={onChange}
            placeholder={'Select kind'}
        />
    );
}

type TGateKindSelectorDescriptor = TValueDescriptor2<TSelectProps['options']>;

function useData({ gateType }: { gateType: EGateType }): TGateKindSelectorDescriptor {
    const traceId = useTraceId();
    const getGateKinds = useModule(ModuleFetchGateKindsOnCurrentStage);

    const gateKinds = useNotifiedValueDescriptorObservable(getGateKinds(undefined, { traceId }));

    return useMemo(() => {
        return matchValueDescriptor(gateKinds, ({ value: { execGates, mdGates } }) => {
            const kinds = gateType === EGateType.execGate ? execGates : mdGates;
            return createSyncedValueDescriptor(
                kinds.map((kind) => ({
                    label: kind,
                    value: kind,
                })),
            );
        });
    }, [gateKinds, gateType]);
}
