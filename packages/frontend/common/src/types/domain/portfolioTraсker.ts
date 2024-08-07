import type { ISO, Opaque } from '@common/types';

import type { TStructurallyCloneableObject } from '../serialization';
import type { TVirtualAccountId } from './account';
import type { TAssetId } from './asset';
import type { TInstrumentId } from './instrument';
import type { ESide } from './task';

export type TPortfolioId = Opaque<'PortfolioId', number>;
export type TPortfolioBookId = Opaque<'BookId', number>;
export type TGreekByPeriod = Array<number>; // fixed length = 10;
export enum EGreekByPeriodName {
    '1m' = '1m',
    '2m' = '2m',
    '3m' = '3m',
    '6m' = '6m',
    '1y' = '1y',
    '2y' = '2y',
    '3y' = '3y',
    '5y' = '5y',
}
export const GREEK_BY_PERIOD_NAMES = Object.values(EGreekByPeriodName);
export type TPortfolioGammaGreek = {
    baseAssetId: TAssetId;
    value: number;
};

export type TPortfolio = {
    portfolioId: TPortfolioId;
    name: string;
    owner: string;
    platformTime: ISO;
};

export type TPortfolioVegaGreek = {
    baseAssetId: TAssetId;
    value: TGreekByPeriod;
};

export type TPortfolioBook = {
    bookId: TPortfolioBookId;
    portfolioId: TPortfolioId;
    name: string;
    tradeFilter: TPortfolioTradeFilter[];
    creationTime: ISO;
    platformTime: ISO;
};

export type TPortfolioBookRecord = Record<TPortfolioBookId, TPortfolioBook>;

export type TPortfolioTradeFilter = {
    virtualAccountId: null | TVirtualAccountId;
};

export type TPortfolioPositionId = Opaque<'PortfolioPositionId', string>;
export type TPortfolioPosition = {
    // will be generated on the client side
    id: TPortfolioPositionId;
    bookId: TPortfolioBookId;
    instrumentId: TInstrumentId;
    amount: number;
    avgPrice: number;
    lastPrice: number;
    platformTime: ISO;
};

export type TPortfolioRisksId = Opaque<'PortfolioRisksId', string>;
export type TPortfolioRisks = {
    // will be generated on the client side
    id: TPortfolioRisksId;
    bookId: TPortfolioBookId;
    assetId: TAssetId;
    cashBalance: number;
    theta: number;
    deltaFxAtm: number;
    deltaFxSkew: number;
    thetaFx: number;
    convertRate: number;
    todayFixing: number;
    dv: number;
    rhos: number[];
    gammas: Array<TPortfolioGammaGreek>;
    vegas: Array<TPortfolioVegaGreek>;
    platformTime: ISO;
};

export type TPortfolioTradeId = Opaque<'PortfolioTradeId', number>;

export type TPortfolioTrade = {
    tradeId: TPortfolioTradeId;
    bookId: TPortfolioBookId;
    instrumentId: TInstrumentId;
    amount: number;
    price: number;
    fee: {
        amount: number;
        assetId: TAssetId;
    };
    side: ESide;
    platformTime: ISO;
};

export type TPortfolioDebugRiskCalculation = { trades: TStructurallyCloneableObject[] }; // right now it is not important what is inside
