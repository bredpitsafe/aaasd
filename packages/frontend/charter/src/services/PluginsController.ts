import type { TimeseriesCharter } from '../index';
import type { IPlugin } from '../plugins/Plugin';

export class PluginsController {
    private plugins = new Set<IPlugin>();

    constructor(private host: TimeseriesCharter) {}

    destroy(): void {
        this.plugins.forEach(this.removePlugin.bind(this));
    }

    addPlugin(plugin: IPlugin): void {
        plugin.connect(this.host);
        this.plugins.add(plugin);
    }

    removePlugin(plugin: IPlugin): void {
        plugin.disconnect(this.host);
        this.plugins.delete(plugin);
    }

    removeAllPlugins(): void {
        for (const plugin of this.plugins) {
            this.removePlugin(plugin);
        }
    }
}
