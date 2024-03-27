/** Chart follow mode.
 * Applicable only when displaying 'live' data.
 * none - Viewport will not follow updating values.
 * rare - Viewport will follow updating values when it reaches edge of the viewport.
 * permament - Viewport will constantly follow updating values so that it always stays in the viewport.
 * */
export enum EFollowMode {
    none = 'none',
    rare = 'rare',
    permament = 'permament',
    lastPoint = 'lastPoint',
}

export const FRAME_DELAY = 4;
export const EVENT_AUTO_FOLLOW = 'autoFollow';
