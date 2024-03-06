import { Metadata } from '@grpc/grpc-js';
import { isEmpty, isNil } from 'lodash-es';

import { RpcRequestContext } from '../../../rpc/context.ts';
import { TMetadata } from './def.ts';

const AUTHORIZATION_HEADER = 'Authorization';

export function withAuthMetadata(
    ctx: RpcRequestContext,
    metadata: TMetadata = new Metadata(),
): TMetadata {
    const authState = ctx.session.getAuthState();
    if (!isNil(authState) && !isEmpty(authState.rawToken)) {
        metadata.add(AUTHORIZATION_HEADER, `Bearer ${authState.rawToken}`);
    }
    return metadata;
}
