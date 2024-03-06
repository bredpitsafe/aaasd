export enum ESessionTypes {
    Auth = 'Auth',
    NotAuth = 'NotAuth',
    AuthNotRequired = 'AuthNotRequired',
}

export type TSession = {
    type: ESessionTypes;
};
