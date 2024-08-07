import type { TimeseriesCharter } from '../index';

export interface IPlugin {
    connect(host: TimeseriesCharter): void;
    disconnect(host: TimeseriesCharter): void;
}

export class Plugin implements IPlugin {
    protected host?: TimeseriesCharter;

    connect(host: TimeseriesCharter): void {
        this.host = host;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    disconnect(host: TimeseriesCharter): void {
        this.host = undefined;
    }
}
