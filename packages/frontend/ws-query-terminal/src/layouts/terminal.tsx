import type { IJsonModel, TabNode } from 'flexlayout-react';
import type { ReactElement } from 'react';

import { QueryResult } from '../widgets/QueryResult';
import { RequestHistory } from '../widgets/RequestHistory';
import { RequestQuery } from '../widgets/RequestQuery';
import { SavedQueries } from '../widgets/SavedQueries';

enum ETerminalComponents {
    Request = 'Request',
    Response = 'Response',
    History = 'History',
    Saved = 'Saved',
}

export const defaultTerminalLayout: IJsonModel = {
    global: {
        tabEnableClose: false,
        tabEnableRename: false,
    },
    borders: [],
    layout: {
        type: 'row',
        weight: 100,
        children: [
            {
                type: 'row',
                width: 600,
                children: [
                    {
                        type: 'tabset',
                        children: [
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
                                type: 'tab',
                                id: ETerminalComponents.Request,
                                name: ETerminalComponents.Request,
                                component: ETerminalComponents.Request,
                            },
                        ],
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
};

export const getTerminalComponent = (node: TabNode): ReactElement => {
    const component = node.getComponent();
    const id = node.getId();
    const config = node.getConfig();

    switch (component) {
        case ETerminalComponents.Request:
            return <RequestQuery />;
        case ETerminalComponents.Response:
            return <QueryResult />;
        case ETerminalComponents.History:
            return <RequestHistory />;
        case ETerminalComponents.Saved:
            return <SavedQueries />;
    }

    return (
        <div>
            {component}
            {id}
            {config}
        </div>
    );
};
