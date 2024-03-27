const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const { ROOT_DIST } = require('./utils.js');

module.exports = (app) => {
    return {
        target: 'node',
        mode: 'production',
        entry: './src/index.ts',
        output: {
            filename: 'index.js',
            path: path.resolve(ROOT_DIST, app),
            globalObject: 'this',
        },
        // Hardcode several externals that absolutely can not be bundled by Webpack
        externals: [
            {
                express: "require('express')",
                config: "require('config')",
                ws: "require('ws')",
            },
        ],
        plugins: [
            new ForkTsCheckerPlugin(),
            // Ignore `pg-native` dependency that is provided by `pg` package.
            // Otherwise, webpack will explode.
            new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$/ }),
            // Copy `config` folder that contains configuration files for the service.
            new CopyPlugin({
                patterns: [path.resolve('./config/*')],
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.ts$/i,
                    loader: 'swc-loader',
                },
            ],
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    minify: TerserPlugin.swcMinify,
                }),
            ],
        },
    };
};
