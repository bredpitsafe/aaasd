const CI_SERVER_URL = String(process.env.CI_SERVER_URL);
const RUN_VERSION = String(process.env.RUN_VERSION);
const CI_PROJECT_PATH = String(process.env.CI_PROJECT_PATH);
const CI_BUILD_REF_NAME = String(process.env.CI_BUILD_REF_NAME);
const CI_COMMIT_AUTHOR = String(process.env.CI_COMMIT_AUTHOR);
const LINK_REPOSITORY = `${CI_SERVER_URL}/${CI_PROJECT_PATH}/-/tree/${CI_BUILD_REF_NAME}`;
const LINK_ACTION = `${CI_SERVER_URL}/${CI_PROJECT_PATH}/-/pipelines/${RUN_VERSION}/test_report`;
const HEADER_REPOSITORY = `Autotests passed on repository: <${LINK_REPOSITORY}| ${CI_BUILD_REF_NAME}>\nAuthor: ${CI_COMMIT_AUTHOR}\n`;
const HEADER_ACTION = `GitLab TestReport : <${LINK_ACTION}|ID #${RUN_VERSION}>\n`;

module.exports = `${HEADER_REPOSITORY}${HEADER_ACTION}`;
