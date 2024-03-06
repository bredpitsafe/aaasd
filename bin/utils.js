const { execSync } = require('child_process');
const { stringifyWeekAndTime } = require('./date-utils');

const RELEASE_BRANCH_PREFIX = 'release';
const FIX_BRANCH_PREFIX = 'fix';
const REVERT_BRANCH_PREFIX = 'fix';
const MASTER_BRANCH = 'master';
const POSSIBLE_BUGFIX_PREFiXES = [FIX_BRANCH_PREFIX, REVERT_BRANCH_PREFIX];

function getCurrentBranch() {
    return execSync('git branch --show-current').toString().trim();
}

function createBranch(targetBranch, commit) {
    console.info(`[*] Create branch '${targetBranch}'`);
    execSync(`git branch ${targetBranch} ${commit}`);
}

function getPreviousTag(tag) {
    try {
        return execSync(`git describe --abbrev=0 ${tag}^`).toString().trim();
    } catch (e) {
        return null;
    }
}

function getLastTag(branch) {
    branch = branch ?? getCurrentBranch();

    return execSync(`git describe --tags --abbrev=0 ${branch}`).toString().trim();
}

function getLastCommit(branch) {
    return getLastCommitInfo(branch)?.commit;
}

function getLastCommitInfo(branch) {
    branch = branch ?? getCurrentBranch();

    return parseLogInfo(
        execSync(`git log ${branch ?? getCurrentBranch()} -n 1 --oneline --no-abbrev-commit`)
            .toString()
            .trim(),
    );
}

function getCommitByTag(tagName) {
    return execSync(`git rev-list -n 1 ${tagName}`).toString().trim();
}

function getFirstTagCommit(branchName) {
    const firstBranchCommitInfo = parseLogInfo(
        execSync(`git log master..${branchName} --oneline | tail -1`).toString().trim(),
    );

    const tag = execSync(
        ` git describe --contains "${firstBranchCommitInfo.commit}" | sed 's/~.*//'`,
    )
        .toString()
        .trim();

    return getCommitByTag(tag);
}

function getCommitDate(commit) {
    if (!commit) {
        return null;
    }

    const isoDate = execSync(`git show -s --format=%cI ${commit}`).toString().trim();

    if (!isoDate) {
        throw new Error(`Can't resolve date for commit "${commit}"`);
    }

    return new Date(isoDate);
}

function parseLogInfo(logInfo) {
    const commit = logInfo.match(/^([a-f0-9]+)/)[1];
    const branchMatch = logInfo.match(/Merge\s+branch\s*'([^']+)'/);
    const jira = logInfo.match(/(?:^|\W)(FRT-\d+)/i)?.[1]?.toUpperCase() ?? 'FRT-0';
    const isRealBranch = !!branchMatch;
    const branch = isRealBranch
        ? branchMatch[1]
        : `${
              logInfo.match(/^(?:[a-f0-9]+)\s+(?:\([^)]+\)\s+)?(\w+)/)?.[1] ?? 'fix'
          }/${jira}_direct_merge_${new Date().toISOString().replaceAll(/\W+/g, '_')}`;

    const info = isRealBranch
        ? branch
        : logInfo.match(/^(?:[a-f0-9]+)\s+(?:\([^)]+\)\s+)?(.+)$/)?.[1] ?? '';

    return {
        commit,
        commitMessage: getCommitMessage(commit),
        isRealBranch,
        branch,
        info,
        jira,
        type: branch.match(/([^\/]+)/i)?.[1]?.toLowerCase(),
        date: getCommitDate(commit),
    };
}

function getBaseCommitHash(branch, startTime, endTime) {
    branch = branch ?? getCurrentBranch();

    const afterOption = startTime ? `--after="${new Date(startTime).toISOString()}"` : '';
    const beforeOption = endTime ? `--before="${new Date(endTime).toISOString()}"` : '';

    const dateFormatOption = afterOption || beforeOption ? '--date=iso-strict' : '';

    const filterGitlabMergeOption = `--grep "Merge branch .* into '${branch}'"`;

    const oneLineOption = `--oneline`;

    const fullCommitHashOption = `--no-abbrev-commit`;

    const onlyLastOption = '-1';

    const reverseOption = '--reverse';

    const commandBaseCommit = `git log ${branch}`;

    const baseCommitHash = execSync(
        [
            commandBaseCommit,
            oneLineOption,
            afterOption,
            beforeOption,
            dateFormatOption,
            filterGitlabMergeOption,
            fullCommitHashOption,
            beforeOption ? onlyLastOption : reverseOption,
        ]
            .filter((command) => command)
            .join(' '),
    )
        .toString()
        .trim()
        .split(/[\r\n]+/)
        .filter((_, index) => index === 0)
        .map((logInfo) => logInfo.match(/^([a-f0-9]+)/)[1])[0];

    return baseCommitHash ? baseCommitHash : null;
}

function getCommitMessage(commit) {
    return execSync(`git log --format=%B -n 1 ${commit}`).toString().trim();
}

function hasLocalBranch(branch) {
    try {
        execSync(`git show-branch ${branch}`, { stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

function hasRemoteBranch(branch, remote) {
    remote = remote ?? getRemoteNames()?.[0] ?? 'origin';
    try {
        execSync(`git show-branch ${remote}/${branch}`, { stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

function createLocalBranchFromRemote(branch, remote) {
    remote = remote ?? getRemoteNames()?.[0] ?? 'origin';
    try {
        execSync(`git branch ${branch} ${remote}/${branch}`, { stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

function getTagsDescription(branch, startCommit) {
    const tags = execSync(`git tag --contains ${startCommit} --merged ${branch}`)
        .toString()
        .trim()
        .split(/[\r\n]+/)
        .map((tag) => tag.trim())
        .filter((tag) => !!tag);

    return tags
        .reduce((tags, tag) => {
            let startCurrentCommit;

            if (tags.length === 0) {
                const previousTag = getPreviousTag(tag);
                startCurrentCommit = previousTag ? getCommitByTag(previousTag) : startCommit;
            } else {
                startCurrentCommit = tags[tags.length - 1].commit;
            }

            const tagCommit = getCommitByTag(tag);
            const releaseBranch = createReleaseBranchName(tag);
            const tagInfo = {
                tag,
                releaseBranch,
                hasLocalRelease: hasLocalBranch(releaseBranch),
                hasRemoteRelease: hasRemoteBranch(releaseBranch),
                commit: tagCommit,
                date: getCommitDate(tagCommit),
                log: execSync(
                    `git log ${startCurrentCommit}..${tagCommit} --oneline --no-abbrev-commit --first-parent`,
                )
                    .toString()
                    .trim()
                    .split(/[\r\n]+/)
                    .filter((tag) => !!tag)
                    .map((logInfo) => parseLogInfo(logInfo))
                    .filter(({ type }) => ['fix', 'feat'].includes(type)),
            };

            tags.push(tagInfo);
            return tags;
        }, [])
        .sort(({ date: first }, { date: second }) => first.valueOf() - second.valueOf());
}

/**
 * Finds commits by type starting from base commit.
 * Returns:
 *  {
 *    commit: string; // Full commit hash
 *    branch: string; // Merged branch name
 *    jira: string; // JIRA FRT issue
 *    type: string; // Conventional Commit type - https://www.conventionalcommits.org/en/v1.0.0/#summary
 *    date: Date; // Commit date
 *  }[]
 * */
function getCommits(branch, startCommit, types) {
    branch = branch ?? getCurrentBranch();

    const oneLineOption = `--oneline`;

    const fullCommitHashOption = `--no-abbrev-commit`;

    const reverseOption = '--reverse';

    const commandHistoryCommits = `git log ${startCommit}..${branch}`;

    return execSync(
        [commandHistoryCommits, oneLineOption, fullCommitHashOption, reverseOption]
            .filter((command) => command)
            .join(' '),
    )
        .toString()
        .trim()
        .split(/[\r\n]+/)
        .filter((logInfo) => logInfo.length > 0)
        .map((logInfo) => parseLogInfo(logInfo))
        .filter(({ type }) => types === undefined || types.includes(type));
}

function tryMergeCommit(commit, commitBranch, message) {
    try {
        console.info(`[*] Merge commit "${commit}" (${commitBranch}) in "${getCurrentBranch()}"`);
        execSync(
            `git merge --no-ff ${commit}${
                message ? ` -m '${message.replaceAll(`'`, `'\\''`)}'` : ''
            }`,
        );
        return true;
    } catch (e) {
        console.error(
            `[!] Abort merge commit "${commit}" (${commitBranch}) in "${getCurrentBranch()}`,
        );
        execSync(`git merge --abort`).toString();
        return false;
    }
}

function tryCherryPickCommit(commit, commitBranch, targetBranch) {
    // https://stackoverflow.com/questions/9229301/git-cherry-pick-says-38c74d-is-a-merge-but-no-m-option-was-given
    const originalBranch = getCurrentBranch();
    targetBranch = targetBranch ?? getCurrentBranch();

    try {
        if (originalBranch !== targetBranch) {
            console.info(`[*] Checkout target branch '${targetBranch}'`);
            execSync(`git checkout ${targetBranch}`);
        }

        console.info(
            `[*] Cherry Pick commit "${commit}" ("${commitBranch}" from destination branch) in "${targetBranch}"`,
        );
        execSync(`git cherry-pick ${commit} -m 1`);

        return true;
    } catch (e) {
        console.error(
            `[!] Abort cherry pick commit "${commit}" ("${commitBranch}") in "${getCurrentBranch()}"`,
        );
        execSync(`git cherry-pick --abort`).toString();

        return false;
    } finally {
        if (getCurrentBranch() !== originalBranch) {
            console.info(`[*] Restoring original branch '${originalBranch}'`);
            execSync(`git checkout ${originalBranch}`);
        }
    }
}

/**
 * Finds which commits can be cherry-picked without conflicts.
 * function throws Error
 * Returns:
 *  {
 *    commit: string; // Full commit hash
 *    branch: string; // Merged branch name
 *    jira: string; // JIRA FRT issue
 *    type: string; // Conventional Commit type - https://www.conventionalcommits.org/en/v1.0.0/#summary
 *    date: Date; // Commit date
 *    canCherryPick: boolean; // Flag shows if current commit can be cherry-picked without conflicts
 *  }[]
 * */
function getBugfixesMergeStatus(targetBranch, bugfixes) {
    // https://stackoverflow.com/questions/501407/is-there-a-git-merge-dry-run-option
    const originalBranch = getCurrentBranch();
    targetBranch = targetBranch ?? originalBranch;
    let temporaryBranchCreated = false;

    const temporaryBranchName = `delete/tmp_${new Date().toISOString().replaceAll(/\W+/g, '_')}`;

    try {
        if (originalBranch !== targetBranch) {
            console.info(`[*] Checkout target branch '${targetBranch}'`);
            execSync(`git checkout ${targetBranch}`);
        }

        console.info(
            `[*] Create temporary working branch '${temporaryBranchName}' from '${targetBranch}'`,
        );
        execSync(`git checkout -b ${temporaryBranchName} --no-track`);
        temporaryBranchCreated = true;

        if (getCurrentBranch() !== temporaryBranchName) {
            throw new Error(`Can't checkout temporary '${temporaryBranchName}'`);
        }

        return (
            bugfixes?.map((bugfix) => ({
                ...bugfix,
                canCherryPick: tryCherryPickCommit(bugfix.commit, bugfix.branch),
            })) ?? []
        );
    } finally {
        if (temporaryBranchCreated) {
            console.info(`[*] Resetting temporary branch '${temporaryBranchName}'`);
            execSync(`git reset --hard`);
            execSync(`git clean -n`);
        }
        if (getCurrentBranch() !== originalBranch) {
            console.info(`[*] Restoring original branch '${originalBranch}'`);
            execSync(`git checkout ${originalBranch}`);
        }
        if (temporaryBranchCreated) {
            console.info(`[*] Removing temporary branch '${temporaryBranchName}'`);
            execSync(`git branch -D ${temporaryBranchName}`);
        }
    }
}

/**
 * Checked if there are uncommitted changes
 * */
function hasUncommittedChanges() {
    return execSync('git status --porcelain').toString().trim() !== '';
}

/**
 * Check if there are commits which should be pushed
 * */
function hasUnpushedCommits() {
    try {
        return execSync('git cherry -v').toString().trim() !== '';
    } catch (e) {
        // Remote doesn't exist
        return true;
    }
}

/**
 * Get remote names array
 * */
function getRemoteNames() {
    return execSync('git remote')
        .toString()
        .trim()
        .split(/[\r\n]+/)
        .filter((remoteName, index, array) => array.indexOf(remoteName) === index);
}

/**
 * Fetch remote repository
 * */
function fetchRemoteRepository(remote) {
    remote = remote ?? getRemoteNames()?.[0] ?? 'origin';
    return (
        execSync(`git fetch ${remote} --recurse-submodules=no --progress --prune`)
            .toString()
            .trim() !== ''
    );
}

/**
 * Update local branch
 * */
function updateLocalBranch(localBranch, remote) {
    remote = getRemoteNames()?.[0] ?? 'origin';

    const originalBranch = getCurrentBranch();
    const dst = localBranch ?? originalBranch;

    try {
        if (getCurrentBranch() !== localBranch) {
            console.info(`[*] Checkout target branch '${localBranch}'`);
            execSync(`git checkout ${localBranch}`);
        }

        const remoteBranch = execSync(`git rev-parse --abbrev-ref --symbolic-full-name @{u}`)
            .toString()
            .trim();

        if (!remoteBranch.startsWith(`${remote}/`)) {
            console.info(`[!] Remote branch "${remoteBranch}" doesn't contain "${remote}/"`);
            return false;
        }

        console.info(`[*] Merge remote branch "${remoteBranch}" into "${dst}"`);
        execSync(`git merge ${remoteBranch} -v`);

        return true;
    } catch (e) {
        console.info(`[!] Failed to update, error message - "${e.message}"`);
        return false;
    } finally {
        if (getCurrentBranch() !== originalBranch) {
            console.info(`[*] Restoring original branch '${originalBranch}'`);
            execSync(`git checkout ${originalBranch}`);
        }
    }
}

function checkoutBranch(branch) {
    if (branch && getCurrentBranch() !== branch) {
        console.info(`[*] Checkout target branch '${branch}'`);
        execSync(`git checkout ${branch}`);
    }
}

const VersionType = {
    Master: 'Master',
    Release: 'Release',
};

function createVersionTag(branch, versionType) {
    const originalBranch = getCurrentBranch();

    try {
        checkoutBranch(branch);

        switch (versionType) {
            case VersionType.Master: {
                execSync(`npx standard-version `, {
                    stdio: 'inherit',
                });
                break;
            }
            case VersionType.Release: {
                execSync(`npx standard-version --prerelease release`, {
                    stdio: 'inherit',
                });
                break;
            }
        }

        execSync(`git push --follow-tags --no-verify`, {
            stdio: 'inherit',
        });

        return require('../package.json').version;
    } finally {
        if (getCurrentBranch() !== originalBranch) {
            console.info(`[*] Restoring original branch '${originalBranch}'`);
            execSync(`git checkout ${originalBranch}`);
        }
    }
}

function pushBranch(branch) {
    if (!branch) {
        throw Error('Branch is not specified');
    }
    console.info(`[*] Push branch '${branch}'`);
    execSync(`git push --set-upstream origin ${branch} --no-verify`, {
        stdio: 'inherit',
    });
}

function createBugfixBranchName(name) {
    const date = stringifyWeekAndTime(new Date()).replace(/\W/g, '_');
    return `${FIX_BRANCH_PREFIX}/FRT-0_MOVE_FIXES_FROM_${name}_${date}`;
}

function createBranchWithCommits(branchName, source, commitInfos) {
    let needToDeleteBranch = false;

    const originalBranch = getCurrentBranch();

    try {
        console.info(`[*] Checkout source '${source}'`);

        execSync(`git checkout ${source}`);

        console.info(`[*] Create working branch '${branchName}' from '${source}'`);

        execSync(`git checkout -b ${branchName} --no-track`);

        if (getCurrentBranch() !== branchName) {
            throw new Error(`Can't checkout '${branchName}'`);
        }

        for (const commitInfo of commitInfos) {
            if (!tryCherryPickCommit(commitInfo.commit, branchName)) {
                needToDeleteBranch = true;
                return false;
            }
        }
    } finally {
        if (needToDeleteBranch) {
            console.info(`[*] Resetting branch '${branchName}'`);
            execSync(`git reset --hard`);
            execSync(`git clean -n`);
        }
        if (getCurrentBranch() !== originalBranch) {
            console.info(`[*] Restoring original branch '${originalBranch}'`);
            execSync(`git checkout ${originalBranch}`);
        }
        if (needToDeleteBranch) {
            console.info(`[*] Removing branch '${branchName}'`);
            execSync(`git branch -D ${branchName}`);
        }
    }

    return true;
}

function createReleaseBranchName(name) {
    return `${RELEASE_BRANCH_PREFIX}/${name}`;
}

module.exports = {
    RELEASE_BRANCH_PREFIX,
    FIX_BRANCH_PREFIX,
    MASTER_BRANCH,
    createBranch,
    getCurrentBranch,
    createLocalBranchFromRemote,
    getLastTag,
    getLastCommit,
    getLastCommitInfo,
    getCommitByTag,
    getCommitDate,
    getBaseCommitHash,
    getCommits,
    getBugfixesMergeStatus,
    hasUncommittedChanges,
    hasUnpushedCommits,
    getRemoteNames,
    fetchRemoteRepository,
    updateLocalBranch,
    tryMergeCommit,
    tryCherryPickCommit,
    pushBranch,
    createVersionTag,
    createBranchWithCommits,
    getTagsDescription,
    VersionType,
    createBugfixBranchName,
    createReleaseBranchName,
    getFirstTagCommit,
    POSSIBLE_BUGFIX_PREFiXES,
};
