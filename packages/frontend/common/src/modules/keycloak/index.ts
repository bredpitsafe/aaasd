import Keycloak, { KeycloakFlow, KeycloakOnLoad, KeycloakProfile } from 'keycloak-js';
import { isBoolean, isNil, isUndefined } from 'lodash-es';
import { ReplaySubject } from 'rxjs';

import domains from '../../../../../../configs/domains.json';
import { FailFactory, isFail, TFail } from '../../types/Fail';
import type { Milliseconds, Seconds } from '../../types/time';
import { assertNever } from '../../utils/assert';
import { isWindow } from '../../utils/detect';
import { isProductionDomain } from '../../utils/environment';
import { getPathToRoot } from '../../utils/getPathToRoot';
import { hashString } from '../../utils/hashString';
import { getLocation } from '../../utils/location';
import { macroTasks } from '../../utils/TasksScheduler/macroTasks';
import { getNowMilliseconds, seconds2milliseconds } from '../../utils/time';
import { loggerAuth } from '../../utils/Tracing/Children/auth';
import { isSecureLocation } from '../../utils/url';

const KeycloakFail = FailFactory('keycloak');

type TKeycloakToken = string;

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
    silentCheckSsoRedirectUri: getLocation('origin') + getPathToRoot() + '/keycloak-sso-frame.html',
    silentCheckSsoFallback: false,
    messageReceiveTimeout: AUTH_FRAME_RECEIVE_TIMEOUT,
};

export const keycloakProfile$ = new ReplaySubject<KeycloakProfile | null>(1);
export const keycloakToken$ = new ReplaySubject<TKeycloakToken | null>(1);

const keycloakPromise: Promise<Keycloak> = new Promise(async (res) => {
    if (!isWindow) return;
    // Authentication is only available via HTTPS.
    if (!isSecureLocation()) return;

    const domain = isProductionDomain() ? domains.prod : domains.ms;
    const kc = new Keycloak({
        realm: domain.keycloakRealm,
        url: `${domain.origin}/keycloak/`,
        clientId: 'frontend',
    });

    kc.onAuthLogout = () => {
        forceLogin();
    };
    kc.onAuthSuccess = updateProfileAndToken;
    kc.onAuthError = updateProfileAndToken;
    kc.onAuthRefreshSuccess = updateProfileAndToken;
    kc.onTokenExpired = refreshToken;

    const authenticated = await initKeycloak(kc);

    if (isBoolean(authenticated)) {
        // Run periodic token validity check
        macroTasks.addTimeout(startTokenRefreshing, AUTH_CHECK_INTERVAL);

        loggerAuth.trace(
            `Authentication initialization succeeded. Current auth state is: ${authenticated}`,
        );
    }

    res(kc);
});

function initKeycloak(kc: Keycloak) {
    return kc
        .init(initOptions)
        .then((result) => {
            updateProfileAndToken();

            return result;
        })
        .catch((error) => {
            loggerAuth.error('Authentication initialization failed', error);
            return KeycloakFail('INIT_FAILED');
        });
}

async function updateProfileAndToken() {
    const keycloak = await keycloakPromise;
    if (keycloak.authenticated && keycloak.token) {
        keycloak.loadUserProfile().then((profile) => {
            keycloakProfile$.next(profile);
        });
        loggerAuth.debug(`Received auth token with hash "${hashString(keycloak.token)}"`);
        keycloakToken$.next(keycloak.token);
    } else {
        loggerAuth.warn(`Reset auth token`);
        keycloakProfile$.next(null);
        keycloakToken$.next(null);
    }
}

export async function login() {
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

export async function logout() {
    const keycloak = await keycloakPromise;
    if (keycloak.authenticated === false) return;
    loggerAuth.trace(`Logging out`);
    keycloak.logout({ redirectUri: keycloak.createLoginUrl() });
}

async function startTokenRefreshing() {
    const result = await refreshToken();

    if (isFail(result)) {
        const { code } = result;
        switch (code) {
            case '[keycloak]: FAILED_TO_REFRESH':
                macroTasks.addTimeout(startTokenRefreshing, AUTH_CHECK_AFTER_FAIL_INTERVAL);
                break;
            case '[keycloak]: UNABLE_TO_REFRESH':
                login();
                break;
            default:
                assertNever(code);
        }
        return;
    }

    macroTasks.addTimeout(startTokenRefreshing, AUTH_CHECK_INTERVAL);
}

export async function refreshToken(): Promise<
    TFail<'[keycloak]: UNABLE_TO_REFRESH'> | TFail<'[keycloak]: FAILED_TO_REFRESH'> | true
> {
    loggerAuth.trace('Checking authentication state');
    const keycloak = await keycloakPromise;

    const tokenUpdateResult = await retryOperation(
        (attempt) => {
            loggerAuth.info(`Try to update auth token, attempt #${attempt + 1}`);

            return keycloak.updateToken(MIN_VALIDITY);
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

    if (isFail(tokenUpdateResult)) {
        const { code } = tokenUpdateResult;

        loggerAuth.warn(`Can't update authentication token`, code);

        switch (code) {
            case '[keycloak]: FAILED_TO_REFRESH':
            case '[keycloak]: UNABLE_TO_REFRESH':
                await updateProfileAndToken();
                break;
            default:
                assertNever(code);
        }
    } else if (tokenUpdateResult) {
        loggerAuth.debug(`Authentication token updated successfully`);
        await updateProfileAndToken();
    } else {
        loggerAuth.debug('Authentication token is valid, skipping refresh');
    }

    return isFail(tokenUpdateResult) ? tokenUpdateResult : true;
}

async function handleTokenUpdateErrors() {
    const keycloak = await keycloakPromise;

    // Keycloak deletes the token if the server responds that the token cannot be refreshed
    if (isUndefined(keycloak.token)) {
        return KeycloakFail('UNABLE_TO_REFRESH');
    }

    return KeycloakFail('FAILED_TO_REFRESH');
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
