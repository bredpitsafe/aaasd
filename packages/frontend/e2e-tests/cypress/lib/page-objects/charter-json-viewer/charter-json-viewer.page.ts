import { ECharterJsonViewerSelectors } from '@frontend/common/e2e/selectors/charter-json-viewer/charter-json-viewer.page.selectors';

import { BasePage } from '../../base.page';
import { Text } from '../../base/elements/text';
import { EPagesUrl } from '../../interfaces/url-interfaces';

const PAGE_URL = EPagesUrl.charterJsonViewer;

class CharterJsonViewerPage extends BasePage {
    readonly mainCanvasText = new Text(ECharterJsonViewerSelectors.ChartCanvasView);

    constructor() {
        super(PAGE_URL);
    }

    checkElementsExists(): void {
        this.mainCanvasText.checkExists();
    }
}

export const charterJsonViewerPage = new CharterJsonViewerPage();
