import type { Milliseconds, Seconds } from '@common/types';
import { getNowMilliseconds, seconds2milliseconds } from '@common/utils';
import type { KeycloakConfig, KeycloakFlow, KeycloakOnLoad } from 'keycloak-js';
import Keycloak from 'keycloak-js';
import { isNil, isUndefined } from 'lodash-es';
import { ReplaySubject } from 'rxjs';

import type { TKeycloakProfile, TKeycloakToken } from '../../types/domain/evironment.ts';
import { Fail } from '../../types/Fail.ts';
import { EGrpcErrorCode } from '../../types/GrpcError.ts';
import { isWindow } from '../../utils/detect.ts';
import { APP_ROOT_PATH } from '../../utils/getPathToRoot.ts';
import { hashString } from '../../utils/hashString.ts';
import { getLocation } from '../../utils/location.ts';
import { macroTasks } from '../../utils/TasksScheduler/macroTasks.ts';
import { loggerAuth } from '../../utils/Tracing/Children/auth.ts';
import { isSecureLocation } from '../../utils/url.ts';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
    isFailValueDescriptor,
} from '../../utils/ValueDescriptor/utils.ts';

const AUTH_FRAME_RECEIVE_TIMEOUT = (60 * 1000) as Milliseconds;
const AUTH_CHECK_INTERVAL = (5 * 60 * 1000) as Milliseconds;
const AUTH_CHECK_AFTER_FAIL_INTERVAL = (3 * 1000) as Milliseconds;
const MIN_VALIDITY = (5 * 60) as Seconds;
const RETRY_TOKEN_DELAY_MIN = 1_000 as Milliseconds;
const RETRY_TOKEN_DELAY_MAX = 60_000 as Milliseconds;
const MAX_ATTEMPTS_COUNT = 100;
const initOptions = {
    flow: 'standard' as KeycloakFlow,
    onLoad: 'check-sso' as KeycloakOnLoad,
    silentCheckSsoRedirectUri: getLocation('origin') + APP_ROOT_PATH + '/keycloak-sso-frame.html',
    silentCheckSsoFallback: false,
    messageReceiveTimeout: AUTH_FRAME_RECEIVE_TIMEOUT,
};

export type TKeycloakInstance = ReturnType<typeof createKeycloakInstance>;

export function createKeycloakInstance(config: KeycloakConfig) {
    const keycloakProfile$ = new ReplaySubject<TKeycloakProfile | null>(1);
    const keycloakToken$ = new ReplaySubject<TKeycloakToken | null>(1);

    const keycloakPromise = new Promise<Keycloak>(async (resolve, reject) => {
        if (!isWindow) return reject('Keycloak is only available in the browser');
        // Authentication is only available via HTTPS.
        if (!isSecureLocation()) return reject('Keycloak is only available in secure locations');

        const kc = new Keycloak(config);

        kc.onAuthError = updateProfileAndToken;
        kc.onAuthLogout = forceLogin;
        kc.onAuthSuccess = updateProfileAndToken;
        kc.onTokenExpired = refreshToken;
        kc.onAuthRefreshSuccess = updateProfileAndToken;

        const authenticated = await kc.init(initOptions);

        // Run periodic token validity check
        macroTasks.addTimeout(startTokenRefreshing, AUTH_CHECK_INTERVAL);

        loggerAuth.trace(
            `Authentication initialization succeeded. Current auth state is: ${authenticated}`,
        );

        resolve(kc);
    }).catch((error) => {
        loggerAuth.error('Authentication initialization failed', error);
        throw error;
    });

    async function updateProfileAndToken() {
        const keycloak = await keycloakPromise;
        if (keycloak.authenticated && keycloak.token) {
            try {
                const profile = await keycloak.loadUserProfile();
                loggerAuth.debug(`Received auth token with hash "${hashString(keycloak.token)}"`);
                keycloakProfile$.next(profile);
                keycloakToken$.next(keycloak.token as TKeycloakToken);
            } catch (error) {
                loggerAuth.error(`Failed to load user profile`, error);
            }
        } else {
            loggerAuth.warn(`Reset auth token`);
            keycloakProfile$.next(null);
            keycloakToken$.next(null);
        }
    }

    async function login(): Promise<undefined> {
        const keycloak = await keycloakPromise;
        if (keycloak.authenticated === true) return;
        loggerAuth.trace(`Logging in`);
        keycloak.login();
    }

    async function forceLogin() {
        const keycloak = await keycloakPromise;
        loggerAuth.trace(`Force logging in`);
        keycloak.login();
    }

    async function logout(): Promise<undefined> {
        const keycloak = await keycloakPromise;
        if (keycloak.authenticated === false) return;
        loggerAuth.trace(`Logging out`);
        keycloak.logout({ redirectUri: keycloak.createLoginUrl() });
    }

    async function startTokenRefreshing() {
        const result = await refreshToken();

        if (isFailValueDescriptor(result)) {
            const { fail } = result;
            switch (fail.code) {
                case EGrpcErrorCode.UNKNOWN:
                    macroTasks.addTimeout(startTokenRefreshing, AUTH_CHECK_AFTER_FAIL_INTERVAL);
                    break;
                case EGrpcErrorCode.UNAVAILABLE:
                    login();
                    break;
                default:
                    loggerAuth.error(`Unexpected error during token refreshing`, fail);
            }
            return;
        }

        macroTasks.addTimeout(startTokenRefreshing, AUTH_CHECK_INTERVAL);
    }

    async function refreshToken(): Promise<TValueDescriptor2<true>> {
        const keycloak = await keycloakPromise;

        const tokenUpdateResult = await retryOperation(
            (attempt) => {
                loggerAuth.info(`Try to update auth token, attempt #${attempt + 1}`);

                return keycloak.updateToken(MIN_VALIDITY).then(createSyncedValueDescriptor);
            },
            (attempt: number) => {
                loggerAuth.warn(`Can't update authentication token from #${attempt + 1} attempt`);

                const expiration = keycloak.refreshTokenParsed?.exp as Seconds | undefined;

                if (
                    isNil(expiration)
                        ? attempt > MAX_ATTEMPTS_COUNT
                        : seconds2milliseconds(expiration) < getNowMilliseconds()
                ) {
                    return false;
                }

                return Math.min(
                    Math.round(Math.pow(1.5, attempt) * RETRY_TOKEN_DELAY_MIN),
                    RETRY_TOKEN_DELAY_MAX,
                ) as Milliseconds;
            },
        ).catch(handleTokenUpdateErrors);

        if (isFailValueDescriptor(tokenUpdateResult)) {
            loggerAuth.warn(`Can't update authentication token`, tokenUpdateResult.fail);
            await updateProfileAndToken();
        } else if (tokenUpdateResult.value === true) {
            loggerAuth.debug(`Authentication token updated successfully`);
            await updateProfileAndToken();
        } else {
            loggerAuth.debug('Authentication token is valid, skipping refresh');
        }

        return isFailValueDescriptor(tokenUpdateResult)
            ? tokenUpdateResult
            : createSyncedValueDescriptor(true);
    }

    async function handleTokenUpdateErrors() {
        const keycloak = await keycloakPromise;

        // Keycloak deletes the token if the server responds that the token cannot be refreshed
        if (isUndefined(keycloak.token)) {
            return createUnsyncedValueDescriptor(
                Fail(EGrpcErrorCode.UNAVAILABLE, { message: 'Unable to refresh' }),
            );
        }

        return createUnsyncedValueDescriptor(
            Fail(EGrpcErrorCode.UNKNOWN, { message: 'Failed to refresh' }),
        );
    }

    return {
        keycloakProfile$,
        keycloakToken$,
        login,
        logout,
        refreshToken,
    };
}

function retryOperation<T>(
    promiseFactory: (attempt: number) => Promise<T>,
    shouldRetry: (attempt: number, failReason: unknown) => false | Milliseconds,
): Promise<T> {
    const innerRetryOperation = (attempt: number): Promise<T> =>
        new Promise((resolve, reject) =>
            promiseFactory(attempt)
                .then(resolve)
                .catch((reason) => {
                    const retryDelay = shouldRetry(attempt, reason);

                    if (retryDelay === false) {
                        return reject(reason);
                    }

                    return setTimeout(
                        () =>
                            innerRetryOperation(attempt + 1)
                                .then(resolve)
                                .catch(reject),
                        retryDelay,
                    );
                }),
        );

    return innerRetryOperation(0);
}
