import { TContextRef } from '../../di';
import { createActor } from '../../utils/Actors';
import { EActorName } from '../Root/defs';
import { getPortfoliosWithBooksDedobsed } from './actions/getPortfolioBooks';
import { getPortfolioPositionsDedobsed } from './actions/getPortfolioPositions';
import { getPortfolioRisksDedobsed } from './actions/getPortfolioRisks';
import { getPortfolioTradesDedobsed } from './actions/getPortfolioTrades';
import {
    getPortfolioPositionsEnvBox,
    getPortfolioRisksEnvBox,
    getPortfoliosWithBooksEnvBox,
    getPortfolioTradesEnvBox,
} from './envelops';

export function createActorPortfolioTrackerDataProvider() {
    return createActor(EActorName.PortfolioTrackerHandlers, async (context) => {
        const ctx = context as unknown as TContextRef;

        getPortfoliosWithBooksEnvBox.responseStream(context, (props) =>
            getPortfoliosWithBooksDedobsed(ctx, props),
        );

        getPortfolioPositionsEnvBox.responseStream(context, (props) =>
            getPortfolioPositionsDedobsed(ctx, props),
        );

        getPortfolioTradesEnvBox.responseStream(context, (props) =>
            getPortfolioTradesDedobsed(ctx, props),
        );

        getPortfolioRisksEnvBox.responseStream(context, (props) =>
            getPortfolioRisksDedobsed(ctx, props),
        );
    });
}
