import type { TVirtualAccountEntityId } from '@frontend/common/src/types/domain/entityIds.ts';
import type { TExchange } from '@frontend/common/src/types/domain/exchange';

export type THerodotusAccountV2 = {
    exchangeName: TExchange['name'];
    virtualAccountId: TVirtualAccountEntityId;
};
