import type { RequestHandler } from 'express';

export enum EHttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    PATCH = 'patch',
    DELETE = 'delete',
}

export enum EHttpRouteName {
    HealthCheck = 'healthCheck',
    GetMetrics = 'getMetrics',
    CspReport = 'cspReport',
    SendLogs = 'sendLogs',
}

export type THttpRoute = {
    path: string;
    method: EHttpMethod;
    handler: RequestHandler | RequestHandler[];
};

export type THttpRoutesMap = Record<EHttpRouteName, THttpRoute>;
