import { Router } from 'express';

import type { THttpRoutesMap } from './def.ts';

export class HttpHandler {
    private router: Router;

    constructor(routesMap: THttpRoutesMap) {
        const router = Router();
        for (const route of Object.values(routesMap)) {
            router[route.method](
                route.path,
                ...(route.handler instanceof Array ? route.handler : [route.handler]),
            );
        }
        this.router = router;
    }

    getRouter(): Router {
        return this.router;
    }
}
