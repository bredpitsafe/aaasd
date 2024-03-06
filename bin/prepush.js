const { execSync } = require('child_process');

execSync('npm run branch_name', { stdio: 'inherit' });
execSync('npm run lint', { stdio: 'inherit' });
execSync('npm run types', { stdio: 'inherit' });
execSync('npm run test_unit', { stdio: 'inherit' });
