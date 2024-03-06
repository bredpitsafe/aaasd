import { ModuleFactory } from '../../di';
import {
    cleanComponentMetadata,
    deleteComponentMetadata,
    getComponentMetadata,
    getComponentMetadata$,
    getComponentMetadataByType$,
    getComponentsMetadata$,
    setComponentMetadata,
} from './data';

const module = {
    getComponentMetadataByType$,
    getComponentMetadata$,
    getComponentsMetadata$,
    getComponentMetadata,
    setComponentMetadata,
    deleteComponentMetadata,
    cleanComponentMetadata,
};

export enum ComponentMetadataType {
    Drafts = 'Drafts',
    ScrollPosition = 'ScrollPosition',
    StatusMessageHistory = 'StatusMessageHistory',
    Updating = 'Updating',
    RevisionDigest = 'RevisionDigest',
}

export const ModuleComponentMetadata = ModuleFactory(() => module);
