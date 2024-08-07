import type {
    IJsonModel,
    IJsonRowNode,
    IJsonTabNode,
    IJsonTabSetNode,
    Model,
    Node,
} from 'flexlayout-react';
import { RowNode, TabNode, TabSetNode } from 'flexlayout-react';
import { isEqual, isNil, isNumber } from 'lodash-es';

import type { TPageLayout } from './data.ts';
import { DEFAULT_TAB_WEIGHT, EDefaultLayouts, MAX_TAB_WEIGHT } from './def';

export function createLayout(children: IJsonRowNode['children']): IJsonModel {
    return {
        global: {
            tabEnableClose: true,
            tabEnableRename: false,
            tabSetClassNameTabStrip: 'e2e-tests-tabs-panel',
        },
        borders: [],
        layout: {
            type: 'row',
            weight: 100,
            children,
        },
    };
}

export function createTabJson(name: string, props?: Partial<IJsonTabNode>): IJsonTabNode {
    return {
        type: 'tab',
        component: name,
        name,
        ...props,
    };
}

export function getNewTabsetWeight(model?: Model, weight = DEFAULT_TAB_WEIGHT): number {
    const rootWeight = model
        ?.getRoot()
        .getChildren()
        .reduce((weight, child) => {
            if (child instanceof TabSetNode || child instanceof RowNode) {
                return weight + child.getWeight();
            }
            return weight;
        }, 0);

    // Anything falsy, including zero. Do not change to `isNil`.
    if (isNil(rootWeight) || rootWeight === 0) {
        return MAX_TAB_WEIGHT;
    }

    // Value of 50 means that new tabset will take 50% of all available layout width.
    // In order to achieve that, both weights (new tabset and existing root tabset) must be equal.
    const multiplier = weight / 50;
    return rootWeight * multiplier;
}

type TNode = IJsonRowNode | IJsonTabSetNode | IJsonTabNode;
const FIELDS_TO_COMPARE = {
    row: ['height', 'width'],
    tabset: [
        'height',
        'width',
        'headerHeight',
        'maximized',
        'minHeight',
        'minWidth',
        'name',
        'tabLocation',
        'tabStripHeight',
    ],
    tab: [
        'altName',
        'borderHeight',
        'borderWidth',
        'className',
        'closeType',
        'component',
        'config',
        'enableClose',
        'enableDrag',
        'enableFloat',
        'enableRename',
        'enableRenderOnDemand',
        'floating',
        'helpText',
        'icon',
        'name',
    ],
};

export const compareLayouts = (layout1: IJsonRowNode, layout2: IJsonRowNode) => {
    const compareNodes = (node1: TNode, node2: TNode) => {
        if (node1.type !== node2.type) {
            return false;
        }

        const relevantProperties =
            node1.type === 'row'
                ? FIELDS_TO_COMPARE.row
                : node1.type === 'tabset'
                  ? FIELDS_TO_COMPARE.tabset
                  : FIELDS_TO_COMPARE.tab;

        for (const property of relevantProperties) {
            // @ts-ignore: property is always part of node
            if (!isEqual(node1[property], node2[property])) {
                return false;
            }
        }

        if ('children' in node1 || 'children' in node2) {
            if (!('children' in node1 && 'children' in node2)) return false;
            if (node1.children.length !== node2.children.length) {
                return false;
            }
            if (
                node1.type === 'row' &&
                node2.type === 'row' &&
                !isProportionsEq(
                    node1.children.map((node) => getNodeWeight(node)),
                    node2.children.map((node) => getNodeWeight(node)),
                )
            ) {
                return false;
            }
            for (let i = 0; i < node1.children.length; i++) {
                if (!compareNodes(node1.children[i], node2.children[i])) {
                    return false;
                }
            }
        }

        return true;
    };

    return compareNodes(layout1, layout2);
};

function isProportionsEq(
    arr1: (number | null)[],
    arr2: (number | null)[],
    tolerance = 0.01,
): boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }

    if (arr1.length === 0) {
        return true;
    }

    let initialRatio: number | null = null;

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== null && arr2[i] !== null) {
            if (arr1[i] === 0) {
                if (arr2[i] !== 0) return false;
            } else {
                initialRatio = arr2[i]! / arr1[i]!;
                break;
            }
        } else if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] === null || arr2[i] === null) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        } else if (initialRatio !== null) {
            if (arr1[i] === 0) {
                if (arr2[i] !== 0) {
                    return false;
                }
            } else {
                const currentRatio = arr2[i]! / arr1[i]!;
                if (Math.abs(currentRatio - initialRatio) > tolerance) {
                    return false;
                }
            }
        }
    }

    return true;
}

function getNodeWeight(node: IJsonRowNode | IJsonTabSetNode): number | null {
    if (isNumber(node.width) || isNumber(node.height) || !isNumber(node.weight)) return null;

    return node.weight;
}

export const getSingleTabLayout = (): TPageLayout => ({
    id: EDefaultLayouts.SingleTab,
    value: {
        global: {
            tabSetEnableTabStrip: false,
        },
        borders: [],
        layout: {
            type: 'row',
            weight: 100,
            children: [
                {
                    type: 'tabset',
                    children: [],
                },
            ],
        },
    },
    version: 0,
});

export const isTabNode = (node: Node): node is TabNode => {
    return node.getType() === TabNode.TYPE;
};

export const isRowNode = (node: Node): node is TabNode => {
    return node.getType() === RowNode.TYPE;
};

export const isTabSetNode = (node: Node): node is TabSetNode => {
    return node.getType() === TabSetNode.TYPE;
};
