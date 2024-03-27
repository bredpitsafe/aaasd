import { createActorObservableBox } from '../../utils/Actors/observable';
import {
    TGetPortfoliosWithBooksProps,
    TGetPortfoliosWithBooksReturnType,
} from './actions/getPortfolioBooks';
import {
    TGetPortfolioPositionsProps,
    TGetPortfolioPositionsReturnType,
} from './actions/getPortfolioPositions';
import { TGetPortfolioRisksProps, TGetPortfolioRisksReturnType } from './actions/getPortfolioRisks';
import {
    TGetPortfolioTradesProps,
    TGetPortfolioTradesReturnType,
} from './actions/getPortfolioTrades';

export const getPortfoliosWithBooksEnvBox = createActorObservableBox<
    TGetPortfoliosWithBooksProps,
    TGetPortfoliosWithBooksReturnType
>()('getPortfolioBooks');

export const getPortfolioPositionsEnvBox = createActorObservableBox<
    TGetPortfolioPositionsProps,
    TGetPortfolioPositionsReturnType
>()('getPortfolioPositions');

export const getPortfolioTradesEnvBox = createActorObservableBox<
    TGetPortfolioTradesProps,
    TGetPortfolioTradesReturnType
>()('getPortfolioTrades');

export const getPortfolioRisksEnvBox = createActorObservableBox<
    TGetPortfolioRisksProps,
    TGetPortfolioRisksReturnType
>()('getPortfolioRisks');
