import { WebSocketSubjectConfig } from 'rxjs/webSocket';

import { IMessage } from '../interfaces/server/message-interfaces';

export function waitOneHeartbeat() {
    const config: WebSocketSubjectConfig<IMessage> = {
        url: Cypress.env('webSocketUrl'),
    };

    const options = {
        takeWhileFn: (message: IMessage) => message && message.payload.type !== 'Heartbeat',
    };
    cy.wrap(null, { timeout: 3000 }).then(() =>
        cy.streamRequest<IMessage>(config, options).then((results) => {
            expect(results).to.not.be.undefined;
        }),
    );
}

export function customWait(time) {
    cy.wait(1000 * time);
}
