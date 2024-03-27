### Publish new Version

1. checkout master
2. run `npm run publish_version`

### Fix bug in master branch

1. checkout fix branch from master
2. merge a PR to master
3. run `npm run publish_version`

### Release Cycle

1. checkout master
2. creating new release branch `npm run create_release`
3. Regressions and bugfixes in the release branch
4. publish release `npm run publish_release`

### Fix bug in release branch

1. checkout fix branch from last release branch
2. merge a PR to the release branch
3. checkout master
4. publish release `npm run publish_release`

### Create branch with fixes from last release

1. run `npm run create_branch_with_release_fixes`

### Generate local certificates

1. Install [mkcert](https://github.com/FiloSottile/mkcert), `brew install mkcert` for macOS
2. Install root ca `mkcert -install`
3. Generate certificates `mkdir -p cert && mkcert -key-file cert/localhost-key.pem -cert-file cert/localhost.pem localhost 127.0.0.1 ::1`.
4. (Optional) You can provide custom path to certificates via `DEV_SERVER_SSL_KEY` and `DEV_SERVER_SSL_CERT` env variables in root `.env` file.
