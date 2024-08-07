import type { TVirtualAccount } from '@frontend/common/src/types/domain/account';
import type { TExchange } from '@frontend/common/src/types/domain/exchange';

export type THerodotusAccountV1 = {
    id: TVirtualAccount['id'];
    name: TVirtualAccount['name'];
    exchangeName: TExchange['name'];
};
