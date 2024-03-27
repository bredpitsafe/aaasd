import crypto from 'crypto';
import express from 'express';
import ws from 'express-ws';
import type WebSocket from 'ws';

import { config } from '../config/index.ts';

const app = express();
const wsApp = ws(app);

wsApp.app.ws(config.service.url, (ws: WebSocket) => {
    ws.onmessage = (ev) => {
        if (typeof ev.data !== 'string') {
            ws.send(
                JSON.stringify({
                    error: 'error',
                }),
            );
            return;
        }
        let data;
        try {
            data = JSON.parse(ev.data);
        } catch (e) {
            ws.send(
                JSON.stringify({
                    error: 'error',
                }),
            );
            return;
        }
        console.log('request', data);
        ws.send(
            JSON.stringify({
                payload: 'pong',
                traceId: crypto.randomUUID(),
            }),
        );
    };
});

app.listen(config.service.port, () => {
    console.log('App started on', config.service.port);
});
