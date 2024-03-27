import { EWSRequestTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/ws-request-tab/ws-request.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { Text } from '../../../../base/elements/text';
import { ERobots } from '../../../../interfaces/trading-servers-manager/robots-interfaces';

class WsRequestTab {
    readonly sendButton = new Button(EWSRequestTabSelectors.SendButton);
    readonly stopButton = new Button(EWSRequestTabSelectors.StopButton);
    readonly clearButton = new Button(EWSRequestTabSelectors.ClearButton);
    readonly copyResponseButton = new Button(EWSRequestTabSelectors.CopyResponseButton);
    readonly copyTokenButton = new Button(EWSRequestTabSelectors.CopyTokenButton);
    readonly tabSwitch = new Button(EWSRequestTabSelectors.TabSwitch);
    readonly tabForm = new Text(EWSRequestTabSelectors.TabForm);
    readonly requestForm = new Text(EWSRequestTabSelectors.RequestForm, false);
    readonly responseForm = new Text(EWSRequestTabSelectors.ResponseForm, false);
    readonly requestInput = new Input(EWSRequestTabSelectors.RequestInput, false);
    readonly responseInput = new Input(EWSRequestTabSelectors.ResponseInput, false);

    checkElementsExists() {
        this.sendButton.checkExists();
        this.stopButton.checkExists();
        this.copyResponseButton.checkExists();
        this.copyTokenButton.checkExists();
        this.tabSwitch.checkExists();
        this.tabForm.checkContain('Request');
        this.tabForm.checkContain('Response');
    }

    setRequest(random: string) {
        this.requestInput.checkEnabled();
        this.requestInput.clear();
        this.requestInput
            .get()
            .clear()
            .type(
                `{\n` +
                    `"type": "ExecCommand",\n` +
                    `"id": ${ERobots.Herodotus} ,\n` +
                    `"command": "UpdateConfig",\n` +
                    `"newConfigRaw": "<robot kind=\\"trading_tasks\\">\\n    </robot>\\n<!--${random} -->"`,
                { force: true, delay: 0 },
            );
    }
}

export const wsRequestTab = new WsRequestTab();
