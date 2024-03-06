import { Select } from '@frontend/common/src/components/Select';
import { useModule } from '@frontend/common/src/di/react';
import { getTraceId } from '@frontend/common/src/handlers/utils';
import { ModuleNodeGate } from '@frontend/common/src/modules/NodeGate/ModuleNodeGate';
import { TWithClassname } from '@frontend/common/src/types/components';
import { EComponentConfigType } from '@frontend/common/src/types/domain/component';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { ValueDescriptor } from '@frontend/common/src/types/ValueDescriptor';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import {
    FailDesc,
    isFailDesc,
    isSyncDesc,
    isUnscDesc,
    matchDesc,
    SyncDesc,
    UnscDesc,
} from '@frontend/common/src/utils/ValueDescriptor';
import { ComponentProps, useMemo } from 'react';

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
            options={isSyncDesc(dataDesc) ? dataDesc.value : undefined}
            loading={isUnscDesc(dataDesc)}
            status={isFailDesc(dataDesc) ? 'error' : undefined}
            onChange={onChange}
            placeholder={'Select kind'}
        />
    );
}

const GateKindSelectorFail = FailFactory('GateKindSelectorFail');
const UNKNOWN = GateKindSelectorFail('UNKNOWN');
type TGateKindSelectorDescriptor = ValueDescriptor<TSelectProps['options'], typeof UNKNOWN, null>;

function useData({ gateType }: { gateType: EGateType }): TGateKindSelectorDescriptor {
    const traceId = useMemo(getTraceId, []);
    const { getGateKinds } = useModule(ModuleNodeGate);

    const gateKinds = useValueDescriptorObservableDeprecated(getGateKinds(traceId));

    return useMemo(() => {
        return matchDesc(gateKinds, {
            idle: () => UnscDesc(null),
            unsynchronized: () => UnscDesc(null),
            synchronized: ({ execGates, mdGates }) => {
                const kinds = gateType === EGateType.execGate ? execGates : mdGates;
                return SyncDesc(
                    kinds.map((kind) => ({
                        label: kind,
                        value: kind,
                    })),
                    null,
                );
            },
            fail: () => FailDesc(UNKNOWN),
        });
    }, [gateKinds, gateType]);
}
