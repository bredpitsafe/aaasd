import { of } from 'rxjs';
import { catchError, exhaustMap, first, mergeMap } from 'rxjs/operators';

import { requestLoginEnvBox, sendSessionEnvBox, sendTokenEnvBox } from '../../actors/actions';
import { TContextRef } from '../../di';
import { ModuleActor } from '../../modules/actor';
import { refreshToken } from '../../modules/keycloak';
import { ESessionTypes, getSession$, getSessionToken$ } from '../../modules/session';
import { FailFactory } from '../../types/Fail';
import { isLastActiveTab$ } from '../../utils/observable/isLastActiveTab';
import { loggerAuth } from '../../utils/Tracing/Children/auth';

const KeycloakEffectFail = FailFactory('keycloak_effect');

export async function initAuthentication(ctx: TContextRef) {
    const actor = ModuleActor(ctx);

    getSessionToken$().subscribe((state) => {
        sendTokenEnvBox.send(actor, state);
    });
    getSession$().subscribe((state) => {
        if (state.type !== ESessionTypes.AuthNotRequired) {
            sendSessionEnvBox.send(actor, state);
        }
    });

    initReloginEffect(ctx);
}

function initReloginEffect(ctx: TContextRef) {
    const actor = ModuleActor(ctx);

    const waitTabActivation$ = isLastActiveTab$.pipe(first((v) => v === true));
    const reloginProcess$ = waitTabActivation$.pipe(
        mergeMap(refreshToken),
        catchError((e) => {
            loggerAuth.error(e);
            return of(KeycloakEffectFail('KEYCLOAK_EXEPTION'));
        }),
    );

    requestLoginEnvBox
        .as$(actor)
        .pipe(
            exhaustMap(() => {
                loggerAuth.info('Relogin');
                return reloginProcess$;
            }),
        )
        .subscribe();
}
