import { Router } from 'express';

import { THttpRoutesMap } from './def.ts';

export class HttpHandler {
    private router: Router;

    constructor(routesMap: THttpRoutesMap) {
        const router = Router();
        for (const route of Object.values(routesMap)) {
            router[route.method](route.path, route.handler);
        }
        this.router = router;
    }

    getRouter(): Router {
        return this.router;
    }
}
