const Confirm = require('prompt-confirm');
const List = require('prompt-list');
const { addWeeks, getStartOfWeek, stringifyDate } = require('./date-utils');
const {
    createReleaseBranchName,
    MASTER_BRANCH,
    createBranch,
    getCurrentBranch,
    createLocalBranchFromRemote,
    hasUncommittedChanges,
    hasUnpushedCommits,
    fetchRemoteRepository,
    updateLocalBranch,
    getLastTag,
    getCommitByTag,
    getBaseCommitHash,
    getCommits,
    getBugfixesMergeStatus,
    tryCherryPickCommit,
    pushBranch,
    createVersionTag,
    getLastCommitInfo,
    getFirstTagCommit,
    createBranchWithCommits,
    createBugfixBranchName,
    getTagsDescription,
    VersionType,
    POSSIBLE_BUGFIX_PREFiXES,
} = require('./utils');

function checkCurrentBranch(requiredBranch) {
    const currentBranch = getCurrentBranch();
    if (currentBranch !== requiredBranch) {
        throw new Error(`Please switch to "${requiredBranch}" from "${currentBranch}"`);
    }
    if (hasUncommittedChanges()) {
        throw new Error(
            `Commit changes first. Use "git status" command to display the state of the working directory and the staging area.`,
        );
    }
    if (hasUnpushedCommits()) {
        throw new Error(`Update remote refs along with associated objects first.`);
    }
}

async function askContinueStep(stepName) {
    if (await new Confirm(stepName).run()) {
        return true;
    }

    console.error(`Step "${stepName}" terminated`);

    return false;
}

async function findReleaseInfo() {
    const currentWeekStart = getStartOfWeek();
    const weekBeforeLastStart = getStartOfWeek(addWeeks(currentWeekStart, -3));
    if (
        !(await askContinueStep(
            `*** Find release branch from "${stringifyDate(weekBeforeLastStart, true)}"`,
        ))
    ) {
        return;
    }

    const baseCommitHash = getBaseCommitHash(MASTER_BRANCH, weekBeforeLastStart);

    if (!baseCommitHash) {
        console.warn(
            `Merge commit is not found in '${MASTER_BRANCH}' starting from ${weekBeforeLastStart.toDateString()}`,
        );
        return;
    }

    let tagsInfo = getTagsDescription(MASTER_BRANCH, baseCommitHash).filter(
        ({ hasLocalRelease, hasRemoteRelease }) => hasLocalRelease || hasRemoteRelease,
    );

    if (tagsInfo.length === 0) {
        console.warn(`Releases were not found starting from ${weekBeforeLastStart.toDateString()}`);
        return;
    }

    return selectReleaseTagInfo(tagsInfo);
}

async function selectReleaseTagInfo(tagsInfo) {
    const nameAndCommit = tagsInfo.map((tagInfo) => {
        const base = `${tagInfo.tag} (${stringifyDate(tagInfo.date)})`;
        const description = tagInfo.log
            ?.map(({ isRealBranch, branch, info }) => `"${isRealBranch ? branch : info}"`)
            ?.join(', ');

        return [`${base}${description ? `: ${description}` : ''}`, tagInfo.commit];
    });

    const selectedVersion = await new List({
        name: 'order',
        message: 'Select version?',
        // choices may be defined as an array or a function that returns an array
        choices: nameAndCommit.map(([name]) => name),
    }).run();

    const selectedReleaseCommit = nameAndCommit.find(([option]) => option === selectedVersion)?.[1];

    if (!selectedReleaseCommit) {
        console.warn(`Release version is not selected`);
        return null;
    }

    return tagsInfo.find(({ commit }) => commit === selectedReleaseCommit);
}

async function checkoutToMaster() {
    if (
        !(await askContinueStep(
            `*** Check we are on "${MASTER_BRANCH}" branch, and we don't have uncommitted and unpushed changes`,
        ))
    ) {
        return false;
    }
    checkCurrentBranch(MASTER_BRANCH);

    // eslint-disable-next-line prettier/prettier
    if (!(await askContinueStep(`*** Fetch repository, update "${MASTER_BRANCH}"`))) {
        return false;
    }
    fetchRemoteRepository();
    updateLocalBranch(MASTER_BRANCH);

    return true;
}

async function createReleaseBranch() {
    let stepIndex = await checkoutToMaster();

    if (stepIndex === undefined) {
        return;
    }

    const currentWeekStart = getStartOfWeek();
    const weekBeforeLastStart = getStartOfWeek(addWeeks(currentWeekStart, -2));
    if (
        !(await askContinueStep(
            // eslint-disable-next-line prettier/prettier
            `*** Find version for release from "${stringifyDate(weekBeforeLastStart, true)}"`,
        ))
    ) {
        return;
    }

    const baseCommitHash = getBaseCommitHash(MASTER_BRANCH, weekBeforeLastStart);

    if (!baseCommitHash) {
        console.warn(
            `Merge commit is not found in '${MASTER_BRANCH}' starting from ${weekBeforeLastStart.toDateString()}`,
        );
        return;
    }

    let tagsInfo = getTagsDescription(MASTER_BRANCH, baseCommitHash);

    if (tagsInfo.length === 0) {
        console.warn(`Releases were not found starting from ${weekBeforeLastStart.toDateString()}`);
        return;
    }
    if (
        tagsInfo.every(
            ({ hasLocalRelease, hasRemoteRelease }) => hasLocalRelease || hasRemoteRelease,
        ) ||
        tagsInfo[tagsInfo.length - 1].hasLocalRelease ||
        tagsInfo[tagsInfo.length - 1].hasRemoteRelease
    ) {
        console.warn(
            `Every tag or latest has release branch from ${weekBeforeLastStart.toDateString()}`,
        );
        return;
    }

    tagsInfo.reverse();

    const releaseIndex = tagsInfo.findIndex(
        ({ hasLocalRelease, hasRemoteRelease }) => hasLocalRelease || hasRemoteRelease,
    );

    if (releaseIndex >= 0) {
        tagsInfo = tagsInfo.slice(0, releaseIndex);
    }

    tagsInfo.reverse();

    const selectedReleaseTagInfo = await selectReleaseTagInfo(tagsInfo);

    const releaseVersion = selectedReleaseTagInfo.tag;
    const releaseCommit = selectedReleaseTagInfo.commit;

    if (
        // eslint-disable-next-line prettier/prettier
        !(await askContinueStep(`*** Create release branch for ${releaseVersion}`))
    ) {
        return;
    }

    const bugfixes = getCommits(MASTER_BRANCH, releaseCommit, POSSIBLE_BUGFIX_PREFiXES);

    const releaseBranchName = createReleaseBranchName(releaseVersion);

    createBranch(releaseBranchName, releaseCommit);

    const bugfixesWithStatuses = getBugfixesMergeStatus(releaseBranchName, bugfixes);

    console.info(
        `
Found ${bugfixesWithStatuses.filter(({ canCherryPick }) => canCherryPick).length} of ${
            bugfixesWithStatuses.length
        } bugfixes for "${releaseBranchName}":`,
    );

    bugfixesWithStatuses.forEach((bugfix) => {
        console.info(
            `[${bugfix.canCherryPick ? 'NO CONFLICT' : 'CONFLICT'}] [${stringifyDate(
                bugfix.date,
            )}] Commit "${bugfix.commit}" ${
                bugfix.isRealBranch ? `("${bugfix.branch}")` : `"${bugfix.commitMessage}"`
            }`,
        );
    });

    if (
        !(await askContinueStep(
            `*** Update "${releaseBranchName}" with commits from "${MASTER_BRANCH}"`,
        ))
    ) {
        return;
    }

    for (const bugfix of bugfixesWithStatuses.filter(({ canCherryPick }) => canCherryPick)) {
        if (
            await new Confirm(
                `Cherry Pick commit "${bugfix.commit}" ${
                    bugfix.isRealBranch ? `("${bugfix.branch}")` : `"${bugfix.commitMessage}"`
                }`,
            ).run()
        ) {
            if (!tryCherryPickCommit(bugfix.commit, bugfix.branch, releaseBranchName)) {
                throw new Error(
                    `Conflict detected when trying to cherry-pick "${bugfix.branch}" in "${releaseBranchName}"`,
                );
            }
        }
    }

    pushBranch(releaseBranchName);
}

async function publishReleaseBranch() {
    if (!(await checkoutToMaster())) return;

    const releaseInfo = await findReleaseInfo();

    if (releaseInfo === undefined) return;

    const version = createVersionTag(releaseInfo.releaseBranch, VersionType.Release);

    console.info(`[*] Created release version tag: ${version}`);

    if (
        // skip move bags for initial release
        version.endsWith('.0') ||
        !(await askContinueStep(
            `*** Move fixes from "${releaseInfo.releaseBranch}" to "${MASTER_BRANCH}"?`,
        ))
    ) {
        return;
    }

    await createBranchWithReleaseFixesInternal();
}

async function createBranchWithReleaseFixes() {
    if (!(await checkoutToMaster())) return;
    await createBranchWithReleaseFixesInternal();
}

async function createBranchWithReleaseFixesInternal() {
    const releaseInfo = await findReleaseInfo();

    if (releaseInfo === undefined) return;

    if (!releaseInfo.hasLocalRelease) {
        createLocalBranchFromRemote(releaseInfo.releaseBranch);
    }

    const firstTagCommit = getFirstTagCommit(releaseInfo.releaseBranch);

    if (!firstTagCommit) {
        console.warn(`Can not find first tag commit for "${releaseInfo.releaseBranch}"`);
        return;
    }

    const lastTag = getLastTag(releaseInfo.releaseBranch);
    const branchName = createBugfixBranchName(lastTag);

    if (!(await askContinueStep(`*** Create and push bugfix branch "${branchName}"?`))) {
        return;
    }

    const bugfixes = getCommits(
        releaseInfo.releaseBranch,
        firstTagCommit,
        POSSIBLE_BUGFIX_PREFiXES,
    );
    const created = createBranchWithCommits(branchName, MASTER_BRANCH, bugfixes);

    if (!created) {
        throw new Error(
            `Can't create bugfix branch for commits \n ${bugfixes
                .map(({ commit }, i) => `${i + 1}. ${commit}`)
                .join('\n')}`,
        );
    }

    pushBranch(branchName);
}

async function publishMasterBranch() {
    if (!(await checkoutToMaster())) return;

    const lastCommit = getLastCommitInfo(MASTER_BRANCH);

    if (!lastCommit) {
        console.warn(`Last commit in "${MASTER_BRANCH}" is not merge commit`);
        return;
    }

    if (!['fix', 'feat', 'revert', 'test', 'chore'].includes(lastCommit.type)) {
        console.warn(
            `No need to create preview, last commit type "${lastCommit.type}" is not supported`,
        );
        return;
    }

    const lastTag = getLastTag(MASTER_BRANCH);
    if (lastTag) {
        if (lastCommit.commit === getCommitByTag(lastTag)) {
            console.warn(`No need to create preview, last commit has tag - "${lastTag}"`);
            return;
        }
    }

    if (
        !(await askContinueStep(
            `*** Create preview tag for current release in "${MASTER_BRANCH}" and push`,
        ))
    ) {
        return;
    }

    const version = createVersionTag(MASTER_BRANCH, VersionType.Master);
    console.info(`[*] Created preview version v${version}`);
}

module.exports = {
    publishMasterBranch,
    createReleaseBranch,
    publishReleaseBranch,
    createBranchWithReleaseFixes,
};
