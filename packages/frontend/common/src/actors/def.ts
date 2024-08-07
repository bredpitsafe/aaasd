export type Actor = {
    name: string;
    launch: () => void;
    destroy: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ActorContext<In = any, Out = any> = {};
