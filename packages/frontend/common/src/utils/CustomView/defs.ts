import type { Properties, StandardProperties } from 'csstype';

import type { TXmlToJsonArray } from '../../types/xml';

export const CUSTOM_VIEW_VERSION = 3;

export enum EApplicationOwner {
    TSM = 'TSM',
    Dashboard = 'Dashboard',
}

// Can't use StandardProperties as it breaks compilation
export type TXmlCssProperties = Partial<{
    /** The border shorthand CSS property sets an element's border.
     *  It sets the values of border-width, border-style, and border-color.
     * */
    border: string | number;

    /** The border-radius CSS property rounds the corners of an element's outer border edge.
     *  You can set a single radius to make circular corners, or two radii to make elliptical corners.
     * */
    borderRadius: string | number;

    /** The background-color CSS property sets the background color of an element. */
    backgroundColor: string;

    /** The background shorthand CSS property sets all background style properties at once, such as color,
     *  image, origin and size, or repeat method.
     *  */
    background: string;

    /** The color CSS property sets the foreground color value of an element's text and text decorations,
     *  and sets the <currentcolor> value. currentcolor may be used as an indirect value on other properties
     *  and is the default for other color properties, such as border-color.
     * */
    color: string;

    /** The font-weight CSS property sets the weight (or boldness) of the font.
     *  The weights available depend on the font-family that is currently set.
     */
    fontWeight: string | number;

    /** The font-style CSS property sets whether a font should be styled with a normal,
     *  italic, or oblique face from its font-family.
     */
    fontStyle: string;

    /** The font-size CSS property sets the size of the font. Changing the font size also updates
     *  the sizes of the font size-relative <length> units, such as em, ex, and so forth.
     */
    fontSize: string | number;

    /** The margin CSS property sets the margin area on all four sides of an element.
     *  It is a shorthand for margin-top, margin-right, margin-bottom, and margin-left.
     * */
    margin: string | number;

    /** The padding CSS shorthand property sets the padding area on all four sides of an element at once. */
    padding: string | number;

    /** The width CSS property sets an element's width. */
    width: string | number;

    /** The height CSS property specifies the height of an element. */
    height: string | number;

    /** The text-align CSS property sets the horizontal alignment of the inline-level content inside a block element or table-cell box. */
    textAlign: string;

    /** The gap CSS property sets the gaps (gutters) between rows and columns. It is a shorthand for row-gap and column-gap. */
    gap: string | number;

    /** The display CSS property sets whether an element is treated as a block or inline box and the layout used for its children, such as flow layout, grid or flex. */
    display: string;
}> &
    Record<string, string | number>;

export type TXmlSchemes = {
    scheme?: TXmlToJsonArray<TXmlToJsonScheme>;
};

export type TConverterValue = {
    text?: string;
    tooltip?: string;
    style?: Properties;
};

export type TSchemeElement = {
    value?: number | null;
    left?: number;
    right?: number;
    text?: string;
    tooltip?: string;
    style?: Properties;
};

export type TScheme = {
    name: string;

    config?: TSchemeElement[];

    timeout?: number;
    timeoutStyle?: StandardProperties;
};

export type TXmlToJsonScheme = {
    name: string;

    element?: TXmlToJsonArray<TXmlToJsonSchemeElement>;

    timeout?: string | number;
    timeoutStyle?: TXmlCssProperties;
};

export type TXmlToJsonSchemeElement = {
    value?: string | number | null;
    from?: string | number | null;
    to?: string | number | null;

    text?: string;
    tooltip?: string;

    background?: string;
    borderRadius?: string;
    style?: TXmlCssProperties;
};
