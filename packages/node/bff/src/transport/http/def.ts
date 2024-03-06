import type { Request, Response } from 'express';

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
}

export type THttpRoute = {
    path: string;
    method: EHttpMethod;
    handler: (req: Request, res: Response) => void;
};

export type THttpRoutesMap = Record<EHttpRouteName, THttpRoute>;
