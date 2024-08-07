import type { TPanel } from '../../types/panel';
import { createGridLayoutNxM, createGridSettingsByLayout } from '../layout';
import { addMissingPanelLayouts } from './index';

describe('Test for adding missing panels', () => {
    test('Simple case', () => {
        const result = addMissingPanelLayouts('active', [
            { layouts: [] },
            { layouts: [] },
            {
                layouts: [
                    {
                        name: 'existing',
                        relX: 0.6666666666666666,
                        relY: 0,
                        relWidth: 0.3333333333333333,
                        relHeight: 1,
                        relMinWidth: 0.16666666666666666,
                        relMinHeight: 0.16666666666666666,
                    },
                ],
            },
        ] as unknown as TPanel[]);

        expect(result).toMatchObject([
            {
                layouts: [
                    {
                        name: 'active',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 1,
                        relX: 0,
                        relY: 0,
                    },
                    {
                        name: 'existing',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 0.3333333333333333,
                        relX: 0,
                        relY: 1,
                    },
                ],
            },
            {
                layouts: [
                    {
                        name: 'active',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 1,
                        relX: 0,
                        relY: 1,
                    },
                    {
                        name: 'existing',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 0.3333333333333333,
                        relX: 0,
                        relY: 2,
                    },
                ],
            },
            {
                layouts: [
                    {
                        name: 'existing',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 0.3333333333333333,
                        relX: 0.6666666666666666,
                        relY: 0,
                    },
                    {
                        name: 'active',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 1,
                        relX: 0,
                        relY: 2,
                    },
                ],
            },
        ]);
    });

    test('Case with grid structure', () => {
        const gridLayout = createGridLayoutNxM(4, 2);
        const groundGridSettings = createGridSettingsByLayout(gridLayout);

        const result = addMissingPanelLayouts(
            'active',
            [
                { layouts: [] },
                { layouts: [] },
                {
                    layouts: [
                        {
                            relX: 0.6666666666666666,
                            relY: 0,
                            relWidth: 0.3333333333333333,
                            relHeight: 1,
                            relMinWidth: 0.16666666666666666,
                            relMinHeight: 0.16666666666666666,
                        },
                    ],
                },
                {
                    layouts: [
                        {
                            name: 'existing',
                            relX: 0.6666666666666666,
                            relY: 0,
                            relWidth: 0.3333333333333333,
                            relHeight: 1,
                            relMinWidth: 0.16666666666666666,
                            relMinHeight: 0.16666666666666666,
                        },
                    ],
                },
                { layouts: [] },
                { layouts: [] },
            ] as unknown as TPanel[],
            groundGridSettings,
        );

        expect(result).toMatchObject([
            {
                layouts: [
                    {
                        name: 'active',
                        relHeight: 0.5,
                        relMinHeight: 0.5,
                        relMinWidth: 0.25,
                        relWidth: 0.25,
                        relX: 0,
                        relY: 0,
                    },
                    {
                        name: 'existing',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 0.3333333333333333,
                        relX: 0,
                        relY: 1,
                    },
                ],
            },
            {
                layouts: [
                    {
                        name: 'active',
                        relHeight: 0.5,
                        relMinHeight: 0.5,
                        relMinWidth: 0.25,
                        relWidth: 0.25,
                        relX: 0.25,
                        relY: 0,
                    },
                    {
                        name: 'existing',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 0.3333333333333333,
                        relX: 0,
                        relY: 2,
                    },
                ],
            },
            {
                layouts: [
                    {
                        name: 'active',
                        relHeight: 0.5,
                        relMinHeight: 0.5,
                        relMinWidth: 0.25,
                        relWidth: 0.25,
                        relX: 0.5,
                        relY: 0,
                    },
                    {
                        name: 'existing',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 0.3333333333333333,
                        relX: 0,
                        relY: 3,
                    },
                ],
            },
            {
                layouts: [
                    {
                        name: 'existing',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 0.3333333333333333,
                        relX: 0.6666666666666666,
                        relY: 0,
                    },
                    {
                        name: 'active',
                        relHeight: 0.5,
                        relMinHeight: 0.5,
                        relMinWidth: 0.25,
                        relWidth: 0.25,
                        relX: 0.75,
                        relY: 0,
                    },
                ],
            },
            {
                layouts: [
                    {
                        name: 'active',
                        relHeight: 0.5,
                        relMinHeight: 0.5,
                        relMinWidth: 0.25,
                        relWidth: 0.25,
                        relX: 0,
                        relY: 0.5,
                    },
                    {
                        name: 'existing',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 0.3333333333333333,
                        relX: 0,
                        relY: 4,
                    },
                ],
            },
            {
                layouts: [
                    {
                        name: 'active',
                        relHeight: 0.5,
                        relMinHeight: 0.5,
                        relMinWidth: 0.25,
                        relWidth: 0.25,
                        relX: 0.25,
                        relY: 0.5,
                    },
                    {
                        name: 'existing',
                        relHeight: 1,
                        relMinHeight: 0.16666666666666666,
                        relMinWidth: 0.16666666666666666,
                        relWidth: 0.3333333333333333,
                        relX: 0,
                        relY: 5,
                    },
                ],
            },
        ]);
    });
});
