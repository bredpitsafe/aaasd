const CI_SERVER_URL = String(process.env.CI_SERVER_URL);
const RUN_VERSION = String(process.env.RUN_VERSION);
const CI_PROJECT_PATH = String(process.env.CI_PROJECT_PATH);
const LINK_ACTION =
    CI_SERVER_URL + '/' + CI_PROJECT_PATH + '/-/pipelines/' + RUN_VERSION + '/test_report';
const HEADER_ACTION = 'GitLab TestReport : <' + LINK_ACTION + '|ID #' + RUN_VERSION + '>\n';

module.exports = HEADER_ACTION;
