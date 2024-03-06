import { TIndicator } from '../../modules/actions/indicators/defs';
import { TSocketURL } from '../../types/domain/sockets';
import { getIndicatorKey } from '../utils';

export function modifyIndicators(indicators: TIndicator[], url: TSocketURL) {
    for (let i = 0; i < indicators.length; i++) {
        const indicator = indicators[i];
        indicator.url = url;
        indicator.key = getIndicatorKey(url, indicator.name, indicator.btRunNo);
    }
}
