import { ModuleFactory } from '../../di';
import {
    cleanComponentMetadata,
    configsHasDraft$,
    deleteComponentMetadata,
    getComponentMetadata,
    getComponentMetadata$,
    getComponentMetadataByType$,
    getComponentsMetadata$,
    setComponentMetadata,
} from './data';

export enum ComponentMetadataType {
    Drafts = 'Drafts',
    ScrollPosition = 'ScrollPosition',
    StatusMessageHistory = 'StatusMessageHistory',
    Updating = 'Updating',
    RevisionDigest = 'RevisionDigest',
}

export const ModuleComponentMetadata = ModuleFactory(() => ({
    getComponentMetadataByType$,
    getComponentMetadata$,
    getComponentsMetadata$,
    getComponentMetadata,
    setComponentMetadata,
    deleteComponentMetadata,
    cleanComponentMetadata,
    configsHasDraft$,
}));
