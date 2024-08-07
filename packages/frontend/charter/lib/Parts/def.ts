import { Milliseconds, Opaque, Someseconds } from '@common/types';
import { TraceId } from '@common/utils';
import { TPackedRGBA } from '@frontend/common/src/utils/packRGBA';

export const POINT_ITEM_SIZE = 4;

export type TPointTime = Opaque<'PointDeltaTime', number>; // delta to interval start
export type TPointValue = Opaque<'PointDeltaValue', number>; // delta to baseValue
export type TPointAbsTime = Someseconds;
export type TPointAbsValue = Opaque<'PointAbsValue', number>;
export type TPointColor = TPackedRGBA;
export type TPointWidth = number;
type TPartPointCoord = { x: TPointTime; y: TPointValue };
export type TPartAbsPointCoord = { x: TPointAbsTime; y: TPointAbsValue };
export type TPartPoint = TPartPointCoord & {
    color: TPointColor;
    width: TPointWidth;
};
export type TPartAbsPoint = TPartAbsPointCoord & {
    color: TPointColor;
    width: TPointWidth;
};
export type TSeriesId = Opaque<'SeriesId', string>;
export type TPartId = TraceId;
export type TPartPointBuffer = Opaque<'PartItems', number[]>; // Flat(TPartPoint)[]
export type TPartClosestAbsPoint = null | TPartAbsPoint;
export type TPartClosestPoints = {
    absLeftPoint?: undefined | TPartClosestAbsPoint;
    absRightPoint?: undefined | TPartClosestAbsPoint;
};
export type TPartUnresolved = false | 'live' | 'failed';
export type TPart<Interval extends TPartInterval = TPartInterval> = {
    id: TPartId;
    seriesId: TSeriesId;
    interval: Interval;
    pixelSize: Someseconds;
    baseValue: number;
    buffer: TPartPointBuffer;
    size: number;
    unresolved: TPartUnresolved;
    tsUpdate: Milliseconds;
} & TPartClosestPoints;
export type TPartItemsData = Pick<
    TPart,
    'interval' | 'buffer' | 'baseValue' | 'size' | 'unresolved' | 'absLeftPoint' | 'absRightPoint'
>;

export type TNormalizedPartInterval<Base = Someseconds> = Opaque<
    'NormalizedTimeInterval',
    [Base, Base]
>;
export type TPartInterval<Base = Someseconds> = TNormalizedPartInterval | [Base, Base];

export type TScale = number;
