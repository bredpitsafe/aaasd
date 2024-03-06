export type TPingRequestPayload = {
    type: 'Ping';
    simulateInternalError?: boolean;
    simulateTimeout?: boolean;
};

export type TPingResponsePayload = {
    type: 'Pong';
};
