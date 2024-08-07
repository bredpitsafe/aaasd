import { EAppEnv, EApplicationName } from '@common/types';
import { assert } from '@common/utils';
import configPackage from 'config';
import { isEmpty, isNil } from 'lodash-es';

import type { TAppConfig } from '../def/appConfig.ts';
import { EGrpcClientName } from '../def/grpcClients.ts';
import { EStageCategory, EStageEnv } from '../def/stages.ts';

export const appConfig = configPackage.util.toObject() as unknown as TAppConfig;

export const validateAppConfig = (): void => {
    const { service, stages = {}, oauth } = appConfig;
    const listStages = Object.entries(stages);

    // Check that service has OAuth URL set
    assert(!isEmpty(oauth.url), 'OAuth URL is not set');

    // Check that service actually has correct env configured
    assert(
        Object.values(EAppEnv).includes(service.env),
        `incorrect service env '${service.env}', should be one of: ${Object.values(EAppEnv)}`,
    );

    // Check that service contains any stages at all (if not, it may lack proper NODE_ENV or NODE_CONFIG_ENV variable set
    assert(!isEmpty(listStages), 'service configuration contains no stages');

    // Check that service contains only allowed stages (depending on configured env)

    listStages.forEach(([name, stage]) => {
        // Check that stage.env is set and contains valid value
        assert(
            !isNil(stage.env) && Object.values(EStageEnv).includes(stage.env),
            `stage ${name} has incorrect env '${stage.env}', should be one of: ${Object.values(
                EStageEnv,
            )}`,
        );

        // Check that stage.category is set and contains valid value
        assert(
            !isNil(stage.category) && Object.values(EStageCategory).includes(stage.category),
            `stage ${name} has incorrect category '${
                stage.category
            }', should be one of: ${Object.values(EStageCategory)}`,
        );

        // Check that stage.clientApps is set when stage is `platform` or `client`
        if (
            stage.category === EStageCategory.Platform ||
            stage.category === EStageCategory.Client
        ) {
            assert(Array.isArray(stage.clientApps), `stage '${name}' has no client apps set`);
        }

        // Check that stage.clientApps include only valid app names
        const validAppNames = Object.values(EApplicationName);
        stage.clientApps?.forEach((clientApp) => {
            assert(
                validAppNames.includes(clientApp),
                `stage '${name}' has invalid client app name '${clientApp}'`,
            );
        });

        // Check that stage.grpcClients include only valid service names
        const validGrpcClientNames = Object.values(EGrpcClientName);
        stage.grpcClients?.forEach((grpcClientName) => {
            assert(
                validGrpcClientNames.includes(grpcClientName),
                `stage '${name}' has invalid service name '${grpcClientName}'`,
            );
        });
    });
};
