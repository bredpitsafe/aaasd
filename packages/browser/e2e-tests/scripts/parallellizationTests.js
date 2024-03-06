const { exec } = require('child_process');
const os = require('os');

const numCPUs = os.cpus().length;
const commandList = [
    'npm run cy:run:backtesting',
    'npm run cy:run:charter',
    'npm run cy:run:dashboard',
    'npm run cy:run:index',
    'npm run cy:run:trading-servers-manager:accounts',
    'npm run cy:run:trading-servers-manager:server',
    'npm run cy:run:trading-servers-manager:robots',
    'npm run cy:run:trading-stats',
];

const groups = Array.from({ length: numCPUs }, (_, i) => {
    return commandList.filter((_, j) => j % numCPUs === i);
});

console.log(groups);
const executeCommand = (command) => {
    return new Promise((resolve) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(stderr);
                resolve(false);
            } else {
                console.log(stdout);
                resolve(true);
            }
        });
    });
};

Promise.all(
    groups.map((commands) => {
        return Promise.all(commands.map(executeCommand));
    }),
)
    .then((results) => {
        const hasFailures = results.some((commandResults) => {
            return commandResults.some((result) => !result);
        });
        process.exit(hasFailures ? 1 : 0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
