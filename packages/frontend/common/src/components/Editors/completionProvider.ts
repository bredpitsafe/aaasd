import type { SchemaObject } from 'ajv';
import { camelCase, snakeCase } from 'lodash-es';
import type { editor, IRange, Position } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { languages } from 'monaco-editor/esm/vs/editor/editor.api.js';

import { EConfigEditorLanguages } from './types';
type CompletionItem = languages.CompletionItem;
type ITextModel = editor.ITextModel;

type TSuggestionItem = {
    key: string;
    type?: string | string[];
    description?: string;
    enum?: string[];
};

export function createXMLCompletionProvider(schema: SchemaObject): () => void {
    const disposable = languages.registerCompletionItemProvider(EConfigEditorLanguages.xml, {
        triggerCharacters: ['<'],
        provideCompletionItems: (model, position) =>
            provideCompletionItems(schema, model, position),
    });

    return () => {
        disposable.dispose();
    };
}

function provideCompletionItems(
    completionSchema: SchemaObject,
    model: ITextModel,
    position: Position,
) {
    const { column, lineNumber } = position;
    const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: column,
    });

    // Check whether completion is available at current position and clear text from comments.
    const clearedText = removeNonXMLContent(textUntilPosition);
    const isCompletionAvailable = getAreaInfo(clearedText);

    if (!isCompletionAvailable) {
        return { suggestions: [] };
    }

    const openedTags = getOpenedTags(clearedText);
    const suggestionTags = getAutoCompleteSuggestionTags(completionSchema.properties, openedTags);
    const { startColumn, endColumn } = model.getWordUntilPosition(position);

    const range = {
        startLineNumber: lineNumber,
        endLineNumber: lineNumber,
        startColumn,
        endColumn,
    };
    return {
        suggestions: createSuggestionProposals(range, suggestionTags),
    };
}

function getAutoCompleteSuggestionTags(schema: SchemaObject, path: string[]): TSuggestionItem[] {
    let obj: SchemaObject | undefined = schema;
    const lastPartIndex = path.length - 1;
    for (let i = 0; i <= lastPartIndex; i++) {
        const propName = path[i];
        if (obj !== undefined && propName in obj) {
            const prop: SchemaObject | undefined = obj[propName];
            // If this is not the last path part, we couldn't find any suggestion.
            if (prop === undefined && i < lastPartIndex) {
                return [];
            }

            if (prop !== undefined) {
                // Single path, just follow `properties` (if present)
                if ('properties' in prop) {
                    obj = prop?.properties;
                    // Take the easy way for now and follow the first available path
                } else if ('anyOf' in prop) {
                    obj = prop?.anyOf[0].properties;
                    // Last path part may be end node and contain enums.
                    // Use them as suggestions.
                } else if (i === lastPartIndex && 'enum' in prop) {
                    return prop.enum.map((item: string) => ({
                        key: item,
                        type: 'string',
                    }));
                }
            }
        }
    }

    // Get final suggestions by collecting all properties' names from the current object
    if (obj !== undefined) {
        return Object.entries(obj).map(([key, value]) => ({
            key,
            type: value.type,
            description: value.description,
            enum: value.enum,
        }));
    }

    return [];
}

function removeNonXMLContent(text: string): string {
    // Remove all comments, strings and CDATA
    return text.replace(
        /"([^"\\]*(\\.[^"\\]*)*)"|\'([^\'\\]*(\\.[^\'\\]*)*)\'|<!--([\s\S])*?-->|<!\[CDATA\[(.*?)\]\]>/g,
        '',
    );
}

function getAreaInfo(text: string) {
    // Openings for strings, comments and CDATA
    const items = ['"', "'", '<!--', '<![CDATA['];
    let isCompletionAvailable = true;
    for (let i = 0; i < items.length; i++) {
        const index = text.indexOf(items[i]);
        if (index > -1) {
            text = text.substring(0, index);
            isCompletionAvailable = false;
            break;
        }
    }
    return {
        isCompletionAvailable: isCompletionAvailable,
        clearedText: text,
    };
}

// Create hierarchy of opened tags
function getOpenedTags(text: string): string[] {
    const tags = text.match(/<\/*(?=\S*)([a-zA-Z-_]+)/g);
    if (!tags) {
        return [];
    }

    return tags
        .reduce((acc, tag) => {
            if (tag.indexOf('</') === 0) {
                const openingTag = tag.replace('/', '');
                if (acc[acc.length - 1] === openingTag) {
                    acc.pop();
                }
                return acc;
            }
            acc.push(tag);

            return acc;
        }, [] as string[])
        .map((tag) => camelCase(tag.slice(1)));
}

function createSuggestionProposals(
    range: IRange,
    suggestionTags: TSuggestionItem[],
): CompletionItem[] {
    return suggestionTags.map((suggestion) => {
        const label = snakeCase(suggestion.key);
        let type = suggestion.type ? String(suggestion.type) : undefined;
        let description = suggestion.description ?? '';
        if (suggestion.enum) {
            type = `enum(${suggestion.type})`;
            description = `${description}\nPossible values: ${suggestion.enum}`;
        }
        return {
            label,
            kind: languages.CompletionItemKind.Field,
            insertText: label,
            detail: type,
            range,
            documentation: description,
        };
    });
}
