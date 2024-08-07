import { ModuleFactory } from '../../di';
import {
    addDataSource,
    changeDataSourceStatus,
    dataSourceList$,
    dataSourcesBox,
    deleteDataSource,
    getDataSource$,
    getDataSources$,
    upsertDataSources,
} from './index';

export const createModule = () => {
    return {
        dataSourceMap$: dataSourcesBox.obs,
        dataSourceList$,
        upsertDataSources,
        addDataSource,
        deleteDataSource,
        changeDataSourceStatus,
        getDataSource$,
        getDataSources$,
    };
};

export const ModuleDataSourceStatus = ModuleFactory(createModule);
