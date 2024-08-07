export interface IMessage {
    correlationId: number;
    payload: {
        type: string;
    };
}
