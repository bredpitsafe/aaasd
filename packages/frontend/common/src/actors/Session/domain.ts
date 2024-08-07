export enum ESessionTypes {
    Auth = 'Auth',
    NotAuth = 'NotAuth',
}

export type TSession = {
    type: ESessionTypes;
};
