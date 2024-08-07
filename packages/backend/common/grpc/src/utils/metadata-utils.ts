import type { TAuthorizationHeaderValue } from '@backend/utils/src/constants.ts';
import { AUTHORIZATION_HEADER, TRACE_ID_HEADER } from '@backend/utils/src/constants.ts';
import type { TUserName } from '@common/types';
import type { TraceId } from '@common/utils';
import type { Metadata } from '@grpc/grpc-js';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { first, isEmpty, isObject, last } from 'lodash-es';

export const extractTraceId = (metadata: Metadata): TraceId | undefined => {
    return metadata.get(TRACE_ID_HEADER)?.toString() as TraceId;
};

export const extractToken = (metadata: Metadata) => {
    const bearerToken = first(metadata.get(AUTHORIZATION_HEADER))?.toString() as
        | TAuthorizationHeaderValue
        | undefined;

    return last(bearerToken?.split(' '));
};

type TDecodedKeycloakJwtPayload = JwtPayload & {
    email_verified?: boolean;
    name?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
};

const isKeycloackPayload = (
    payload: ReturnType<typeof jwt.decode>,
): payload is TDecodedKeycloakJwtPayload => isObject(payload) && 'preferred_username' in payload;

const USERNAME_HEADER = 'username-header';

export const extractUsername = (metadata: Metadata) => {
    const username = metadata.get(USERNAME_HEADER).toString() as TUserName;

    if (isEmpty(username)) {
        throw new Error('No username found in metadata');
    }

    return username;
};

export const appendMetadataWithUsernameFromToken = (metadata: Metadata, token: string) => {
    const decodedJwtPayload = jwt.decode(token);
    if (isKeycloackPayload(decodedJwtPayload) && decodedJwtPayload.preferred_username) {
        metadata.add(USERNAME_HEADER, decodedJwtPayload.preferred_username);
    } else {
        throw new Error('Username is missing in the token');
    }
};
