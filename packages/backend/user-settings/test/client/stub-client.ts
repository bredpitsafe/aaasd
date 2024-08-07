import { AUTHORIZATION_HEADER } from '@backend/utils/src/constants.ts';
import { generateTraceId } from '@common/utils';
import * as grpc from '@grpc/grpc-js';
import { services } from '@grpc-schemas/user_settings-api-sdk';
import type { TSubscribeToUserSettingsResponse } from '@grpc-schemas/user_settings-api-sdk/index.services.user_settings.v1.js';

import { EActorName } from '../../src/defs/actors.ts';
import { defaultLogger } from '../../src/utils/logger.ts';

const { UserSettingsServiceClient } = services.user_settings.v1;

const logger = defaultLogger.createChildLogger({
    actor: EActorName.Root,
    traceId: generateTraceId(),
});

const mockedToken = '';

function main() {
    const client = new UserSettingsServiceClient(
        'localhost:9090',
        grpc.credentials.createInsecure(),
    );

    const metadata = new grpc.Metadata();
    metadata.set(AUTHORIZATION_HEADER, mockedToken);

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const upsertUserSettings = () => {
        client.upsertUserSettings(
            {
                params: {
                    settings: [
                        { appName: 'aaa', key: 'kkk', value: `{ rr: 'vvvvv' }` },
                        { appName: 'aaa', key: 'kkkrr', value: `{ rr: 'vvvvv' }` },
                        { appName: 'aaa', key: 'kkkrree', value: `{ ee: 'vvvvv' }` },
                        { appName: 'aaaa', key: 'kkkrr', value: `{ aaaa: 'vvvvv' }` },
                    ],
                },
            },
            metadata,
            (err, response) => {
                logger.info({ message: 'upsertUserSettings response', response, err });
            },
        );
    };

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const subscribeToUserSettings = () => {
        const call = client.subscribeToUserSettings(
            { filters: { app: { appName: 'aaaa', keys: [] } } },
            metadata,
        );

        call.on('data', (res: TSubscribeToUserSettingsResponse) => {
            logger.info({ message: 'response :>> ', res });
            const { response } = res;

            if (response?.type === 'ok') {
                logger.info({ message: 'ok: ', response: response.ok });
            }

            if (response?.type === 'snapshot') {
                logger.info({ message: 'entities: ', entities: response.snapshot.entities });
            }

            if (response?.type === 'updates') {
                logger.info({ message: 'updates: ', updates: response.updates });
            }
        });
        call.on('end', () => {
            logger.info({ message: 'streaming ended' });
        });
        call.on('status', (status) => logger.info({ message: 'status :>> ', status }));
        call.on('error', (error) => logger.info({ message: 'e :>> ', error }));
    };

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const removeUserSettings = () => {
        client.removeUserSettings(
            { filters: { app: { appName: 'aaaa', keys: [] } } },
            metadata,
            (err, response) => {
                logger.info({ message: 'removeUserSettings response', response, err });
            },
        );
    };

    subscribeToUserSettings();
}

main();
