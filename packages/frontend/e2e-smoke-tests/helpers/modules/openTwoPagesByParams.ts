import { Page } from '@playwright/test';

import { IPageParameters } from '../../interfaces/page-parameters-interfaces';

const BUILD_VERSION = String(process.env.RUN_VERSION);

function buildUrlPrefixes(params: IPageParameters) {
    const serverUrlSegment = params.serverUrl ? `/${params.serverUrl}` : '';
    const baseUrl = process.env.CI
        ? `https://ms.advsys.work/${BUILD_VERSION}/dist`
        : 'https://localhost:8080';

    const urlPrefix = `${baseUrl}/${params.appUrl}${serverUrlSegment}`;
    const stableUrlPrefix = `https://ms.advsys.work/stable/dist/${params.appUrl}${serverUrlSegment}`;

    return { urlPrefix, stableUrlPrefix };
}

function appendIdsToUrlPrefixes(
    urlPrefixes: { urlPrefix: string; stableUrlPrefix: string },
    params: IPageParameters,
) {
    if (params.serverId) {
        urlPrefixes.urlPrefix += `/${params.serverId}`;
        urlPrefixes.stableUrlPrefix += `/${params.serverId}`;
    }
    if (params.taskNumber) {
        urlPrefixes.urlPrefix += `/${params.taskNumber}`;
        urlPrefixes.stableUrlPrefix += `/${params.taskNumber}`;
    }
    if (params.robotId) {
        urlPrefixes.urlPrefix += `/${params.robotId}`;
        urlPrefixes.stableUrlPrefix += `/${params.robotId}`;
    }
    return urlPrefixes;
}

function buildUrls(
    urlPrefixes: { urlPrefix: string; stableUrlPrefix: string },
    params: IPageParameters,
) {
    if (!params.tabUrl) {
        const newUrl = `${urlPrefixes.urlPrefix}/${params.pageUrl}?storageId=${params.dashboardId}`;
        const stableUrl = `${urlPrefixes.stableUrlPrefix}/${params.pageUrl}?storageId=${params.dashboardId}`;
        return { newUrl, stableUrl };
    }

    const newUrl = `${urlPrefixes.urlPrefix}${params.pageUrl ? `/${params.pageUrl}` : ''}?tab=${
        params.tabUrl
    }&singleTab=true`;
    const stableUrl = `${urlPrefixes.stableUrlPrefix}${
        params.pageUrl ? `/${params.pageUrl}` : ''
    }?tab=${params.tabUrl}&singleTab=true`;
    return { newUrl, stableUrl };
}

export async function openTwoPagesByParams(
    newPage: Page,
    stablePage: Page,
    params: IPageParameters,
) {
    const { urlPrefix, stableUrlPrefix } = buildUrlPrefixes(params);
    const urlPrefixes = appendIdsToUrlPrefixes({ urlPrefix, stableUrlPrefix }, params);
    const { newUrl, stableUrl } = buildUrls(urlPrefixes, params);

    process.env.NEW_TAB_PATH = newUrl;
    process.env.STABLE_TAB_PATH = stableUrl;

    await newPage.goto(newUrl, {
        waitUntil: 'load',
    });
    await stablePage.goto(stableUrl, {
        waitUntil: 'load',
    });
}
