import type { TimeseriesCharter } from '../../index';
import { Plugin } from '../Plugin';

/* If Alt is pressed, 'wheel' event (scrolling the page)
 will not be intercepted by the chart viewer */
export class ScrollThroughPlugin extends Plugin {
    connect(host: TimeseriesCharter): void {
        super.connect(host);
        this.addListener(host);
    }

    disconnect(host: TimeseriesCharter): void {
        super.disconnect(host);
        this.removeListener(host);
    }

    private addListener(host: TimeseriesCharter): void {
        host.getView().addEventListener('wheel', this.listener, true);
    }

    private removeListener(host: TimeseriesCharter): void {
        host.getView().removeEventListener('wheel', this.listener, true);
    }

    private listener = (ev: WheelEvent): void => {
        if (ev.altKey) {
            ev.stopPropagation();
        }
    };
}
