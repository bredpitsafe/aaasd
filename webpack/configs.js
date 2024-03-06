const path = require('path');
const { DefinePlugin } = require('webpack');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');
const devPorts = require('./devPorts.json');

const {
    env,
    tag,
    isProd,
    DEV_NAME,
    ROOT_DIST,
    getSvgLoader,
    getCssLoader,
    getFontsLoader,
    getTsLoader,
    getImagesLoader,
    getResolve,
    getHtmlWebpackPlugin,
    getCopyConfigsPlugin,
    getCopy1x1Plugin,
    getMonacoPlugin,
    getBundleAnalyzerPlugin,
    getTSCheckerPlugin,
    getCopyKeycloakFramePlugin,
} = require('./utils');

const buildConfig = (configs, optimize = true) =>
    merge([
        {
            devtool: isProd ? undefined : 'eval-source-map', // disabled source maps
            mode: env || DEV_NAME,
            resolve: getResolve(),
            // Don't split build to chunks for `test` environment since it doesn't support it
            optimization: optimize
                ? {
                      splitChunks: {
                          chunks: 'all',
                          cacheGroups: {
                              vendors: {
                                  test: /[\\/]node_modules[\\/]/,
                                  priority: -10,
                                  filename: '[name].vendors.[contenthash].js',
                              },
                              common: {
                                  test: /\/common\/src/,
                                  priority: 0,
                                  filename: '[name].common.[contenthash].js',
                              },
                              monaco: {
                                  test: /monaco-editor/,
                                  priority: 10,
                                  filename: '[name].monaco.[contenthash].js',
                              },
                              agGrid: {
                                  test: /ag-grid/,
                                  priority: 10,
                                  filename: '[name].agGrid.[contenthash].js',
                              },
                              pixi: {
                                  test: /pixi/,
                                  priority: 10,
                                  filename: '[name].pixi.[contenthash].js',
                              },
                          },
                      },
                      minimize: isProd,
                      minimizer: [
                          new TerserPlugin({
                              minify: TerserPlugin.swcMinify,
                              // `terserOptions` options will be passed to `swc` (`@swc/core`)
                              // Link to options - https://swc.rs/docs/config-js-minify
                              // terserOptions: {},
                          }),
                      ],
                  }
                : undefined,
            plugins: [
                new DefinePlugin({
                    'process.env.NODE': JSON.stringify(env),
                    'process.env.npm_package_version': JSON.stringify(
                        require('../package.json').version,
                    ),
                    ...Object.keys(devPorts).reduce((acc, key) => {
                        acc[`process.env.DEV_PORT_${key}`] = devPorts[key];
                        return acc;
                    }, {}),
                }),
            ],
        },
        ...configs,
    ]);

const contextConfig = (dirname) => ({
    context: dirname,
});

const tsConfig = (apps, resolvePathToApp) => ({
    module: {
        rules: [getTsLoader()],
    },
    plugins: [getTSCheckerPlugin(apps, resolvePathToApp)],
});

const cssConfig = () => ({
    module: {
        rules: [getCssLoader(isProd)],
    },
    plugins: [
        new VanillaExtractPlugin({
            identifiers: isProd ? 'short' : 'debug',
        }),
    ].concat(isProd ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' })] : []),
    optimization: {
        minimizer: [new CssMinimizerPlugin()],
    },
});

const fontConfig = {
    module: {
        rules: [getFontsLoader()],
    },
};

const svgConfig = {
    module: {
        rules: [getSvgLoader()],
    },
};

const wasmConfig = {
    experiments: {
        syncWebAssembly: true,
        asyncWebAssembly: true,
    },
};

const htmlConfig = (apps, resolvePathToApp) => ({
    plugins: apps.map((app) =>
        getHtmlWebpackPlugin(
            app,
            path.resolve(`${resolvePathToApp(app)}/src/index.ejs`),
            path.resolve(`${resolvePathToApp(app)}/assets/fav/${app}-96.png`),
        ),
    ),
});

const copyConfig = () => ({
    plugins: [getCopyConfigsPlugin(), getCopy1x1Plugin(), getCopyKeycloakFramePlugin()],
});

const monacoConfig = () => ({
    plugins: [getMonacoPlugin()],
});

const analyzerConfig = () => ({
    plugins: !isProd ? [getBundleAnalyzerPlugin()] : [],
});

const defaultDevServerConfig = (apps) => ({
    devServer: {
        static: {
            directory: ROOT_DIST,
        },
        hot: false,
        https: true,
        historyApiFallback: {
            index: apps.length === 1 ? `/${apps[0]}.html` : '/index.html',
        },
    },
});

const imagesConfig = {
    module: {
        rules: [getImagesLoader()],
    },
};

const defaultInOut = (apps, resolvePathToApp) => ({
    entry: apps.reduce((acc, app) => {
        acc[app] = path.resolve(`${resolvePathToApp(app)}/src/index.ts`);
        return acc;
    }, {}),
    output: {
        filename: isProd ? `[name].[contenthash].js` : `[name].js`,
        path: ROOT_DIST,
        publicPath: isProd ? `/${tag}/dist/` : '/',
    },
});

const defaultAppConfig = (apps) => {
    const resolvePath = (app) => path.resolve(__dirname, '../packages/browser/', app);

    return buildConfig([
        contextConfig(path.resolve(__dirname, '..')),
        defaultInOut(apps, resolvePath),
        fontConfig,
        svgConfig,
        cssConfig(),
        tsConfig(apps, resolvePath),
        wasmConfig,
        htmlConfig(apps, resolvePath),
        copyConfig(),
        monacoConfig(),
        analyzerConfig(),
        imagesConfig,
        defaultDevServerConfig(apps),
    ]);
};

module.exports = {
    buildConfig,
    contextConfig,
    tsConfig,
    wasmConfig,
    htmlConfig,
    defaultDevServerConfig,
    defaultInOut,
    defaultAppConfig,
};
