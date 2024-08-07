import type { TVirtualAccount, TVirtualAccountId } from '@frontend/common/src/types/domain/account';
import type { TAsset, TAssetId } from '@frontend/common/src/types/domain/asset';
import type { TInstrument, TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import type { TRobot, TRobotId } from '@frontend/common/src/types/domain/robots';

export function getIdFromEntity<T extends { id: unknown }>({ id }: T): T['id'] {
    return id;
}

export function getInstrumentIdFromRow<T extends { instrumentId: TInstrumentId }>({
    instrumentId,
}: T): TInstrumentId {
    return instrumentId;
}

export function getInstrumentLabel({ id, exchange, name }: TInstrument): string {
    return `${id} ${exchange}|${name}`;
}

export function getVirtualAccountIdFromRow<T extends { virtualAccountId: TVirtualAccountId }>({
    virtualAccountId,
}: T): TVirtualAccountId {
    return virtualAccountId;
}

export function getVirtualAccountLabel({ id, name }: TVirtualAccount): string {
    return `${id} ${name}`;
}

export function getRobotIdFromRow<T extends { robotId: TRobotId }>({ robotId }: T): TRobotId {
    return robotId;
}

export function getRobotLabel({ id, name }: TRobot): string {
    return `${id} ${name}`;
}

export function getAssetIdFromRow<T extends { assetId: TAssetId }>({ assetId }: T): TAssetId {
    return assetId;
}

export function getAssetLabel({ id, name }: TAsset): string {
    return `${id} ${name}`;
}
