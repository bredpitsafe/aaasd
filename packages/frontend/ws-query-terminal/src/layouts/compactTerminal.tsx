import type { IJsonModel } from 'flexlayout-react';

enum ETerminalComponents {
    Request = 'Request',
    Response = 'Response',
    History = 'History',
    Saved = 'Saved',
}

export const compactTerminalLayout: IJsonModel = {
    global: {
        tabEnableClose: false,
        tabEnableRename: false,
    },
    borders: [],
    layout: {
        type: 'row',
        children: [
            {
                type: 'row',
                children: [
                    {
                        type: 'tabset',
                        weight: 40,
                        children: [
                            {
                                type: 'tab',
                                id: ETerminalComponents.Request,
                                name: ETerminalComponents.Request,
                                component: ETerminalComponents.Request,
                            },
                            {
                                type: 'tab',
                                id: ETerminalComponents.History,
                                name: ETerminalComponents.History,
                                component: ETerminalComponents.History,
                            },
                            {
                                type: 'tab',
                                id: ETerminalComponents.Saved,
                                name: ETerminalComponents.Saved,
                                component: ETerminalComponents.Saved,
                            },
                        ],
                    },
                    {
                        type: 'tabset',
                        children: [
                            {
                                id: ETerminalComponents.Response,
                                name: ETerminalComponents.Response,
                                component: ETerminalComponents.Response,
                            },
                        ],
                    },
                ],
            },
        ],
    },
};
