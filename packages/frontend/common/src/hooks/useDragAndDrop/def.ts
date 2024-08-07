import type { Opaque } from '@common/types';

export enum ESupportedMimeType {
    DragAction = 'text/action',
    'text/xml' = 'text/xml',
    'text/plain' = 'text/plain',
    'application/xml' = 'application/xml',
    'application/json' = 'application/json',
}

export const SupportedMimeTypes = new Set([
    ESupportedMimeType.DragAction,
    ESupportedMimeType['text/xml'],
    ESupportedMimeType['text/plain'],
    ESupportedMimeType['application/xml'],
    ESupportedMimeType['application/json'],
]);

export type TDragActionID = Opaque<'DRAG_ACTION', number>;

export enum ETDragonActionType {
    Native = 'Native',
    Fail = 'Fail',
    Success = 'Success',

    ClonePanel = 'ClonePanel',
}

export type TWithDragActionType<T> = { type: T };

export type TDragActionBase<T extends ETDragonActionType, P> = TWithDragActionType<T> & {
    id: TDragActionID;
    payload: P;
};

export type TDragFailAction = TDragActionBase<ETDragonActionType.Fail, TDragActionID>;
export type TDragSuccessAction = TDragActionBase<ETDragonActionType.Success, TDragActionID>;

export type NativeDragAction = TDragActionBase<ETDragonActionType.Native, DataTransferItem>;
export type ClonePanelDragAction = TDragActionBase<
    ETDragonActionType.ClonePanel,
    {
        from:
            | undefined
            | {
                  dashboardId: string;
                  panelId: string;
              };
        panelXML: string;
        panelRelWidth: number;
        panelRelHeight: number;
    }
>;

export type TDragAction =
    | NativeDragAction
    | TDragFailAction
    | TDragSuccessAction
    | ClonePanelDragAction;

export type ExtractAction<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    A extends TDragActionBase<any, any>,
    T extends ETDragonActionType,
> = Extract<A, TWithDragActionType<T>>;

export type ExtractType<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    A extends TDragActionBase<any, unknown>,
> = A extends TDragActionBase<infer T, unknown> ? T : never;

export type ExtractPayload<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    A extends TDragActionBase<any, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = A extends TDragActionBase<any, infer T> ? T : never;
