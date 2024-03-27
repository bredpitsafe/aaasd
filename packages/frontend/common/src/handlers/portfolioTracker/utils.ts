import {
    TPortfolioPosition,
    TPortfolioPositionId,
    TPortfolioRisks,
    TPortfolioRisksId,
} from '../../types/domain/portfolioTraсker';

export function modifyPositions(items: TPortfolioPosition[]): TPortfolioPosition[] {
    for (let i = 0; i < items.length; i++) {
        items[i].id =
            `position:${items[i].bookId}_${items[i].instrumentId}` as TPortfolioPositionId;
    }

    return items;
}

export function modifyRisks(items: TPortfolioRisks[]): TPortfolioRisks[] {
    for (let i = 0; i < items.length; i++) {
        items[i].id = `asset risks:${items[i].bookId}_${items[i].assetId}` as TPortfolioRisksId;
    }

    return items;
}
