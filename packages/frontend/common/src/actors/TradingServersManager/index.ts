import { TContextRef } from '../../di';
import { createActor } from '../../utils/Actors';
import { EActorName } from '../Root/defs';
import { getComponentState } from './actions/getComponentState';
import { getComponentStateRevision } from './actions/getComponentStateRevision';
import { getComponentStateRevisions } from './actions/getComponentStateRevisions';
import { getGateKinds } from './actions/getGateKinds';
import { initOrdersEffects } from './effects/orders';
import {
    getComponentStateEnvBox,
    getComponentStateRevisionEnvBox,
    getComponentStateRevisionsEnvBox,
    getGateKindsEnvBox,
} from './envelops';

export function createTradingServersManagerDataProvider() {
    return createActor(EActorName.PortfolioTrackerHandlers, (context) => {
        const ctx = context as unknown as TContextRef;

        getComponentStateRevisionEnvBox.responseStream(context, (props) => {
            return getComponentStateRevision(ctx, props);
        });
        getComponentStateRevisionsEnvBox.responseStream(context, (props) => {
            return getComponentStateRevisions(ctx, props);
        });
        getComponentStateEnvBox.responseStream(context, (props) => {
            return getComponentState(ctx, props);
        });
        getGateKindsEnvBox.responseStream(context, (props) => {
            return getGateKinds(ctx, props);
        });

        initOrdersEffects(ctx);
    });
}
