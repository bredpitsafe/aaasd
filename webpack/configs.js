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
    isProd,
    PROD_NAME,
    DEV_NAME,
    E2E_NAME,
    ROOT_DIST,
    PUBLIC_PATH,
    BUILD_PREFIX,
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

const buildConfig = (configs) => {
    const definePluginConf = {
        'process.env.NODE': JSON.stringify(env),
        'process.env.npm_package_version': JSON.stringify(require('../package.json').version),
        ...Object.keys(devPorts).reduce((acc, key) => {
            acc[`process.env.DEV_PORT_${key}`] = devPorts[key];
            return acc;
        }, {}),
        'process.env.IS_ROOT_ROUTING': JSON.stringify(BUILD_PREFIX === 'prod'),
        'process.env.ROOT_PATH': JSON.stringify(PUBLIC_PATH),
    };

    console.log('---DEFINE_PLUGIN_CONFIG', JSON.stringify(definePluginConf));
    console.log('\n\n');

    return merge([
        {
            devtool: isProd ? undefined : 'eval-source-map', // disabled source maps
            mode: isProd ? PROD_NAME : DEV_NAME,
            resolve: getResolve(),
            plugins: [new DefinePlugin(definePluginConf)],
        },
        ...configs,
    ]);
};

const optimizationConfig = (env) => {
    if (env === E2E_NAME) {
        return {};
    }

    return {
        optimization: {
            splitChunks: {
                chunks: 'all',
                minSize: 20000,
                minRemainingSize: 0,
                minChunks: 1,
                maxAsyncRequests: 30,
                maxInitialRequests: 30,
                enforceSizeThreshold: 50000,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        reuseExistingChunk: true,
                        filename: 'vendors.[contenthash].js',
                    },
                    common: {
                        test: /packages\/common/,
                        priority: 100,
                        reuseExistingChunk: true,
                        filename: 'common.[contenthash].js',
                    },
                    monaco: {
                        test: /monaco-editor/,
                        priority: 20,
                        filename: 'monaco.[contenthash].js',
                    },
                    agGrid: {
                        test: /ag-grid.*/,
                        priority: 20,
                        reuseExistingChunk: true,
                        filename: 'agGrid.[contenthash].js',
                    },
                    pixi: {
                        test: /pixi/,
                        priority: 20,
                        reuseExistingChunk: true,
                        filename: 'pixi.[contenthash].js',
                    },
                    react: {
                        test: /(.*react.*)/,
                        priority: 50,
                        reuseExistingChunk: true,
                        filename: 'react.[contenthash].js',
                    },
                    lodash: {
                        test: /lodash/,
                        priority: 15,
                        reuseExistingChunk: true,
                        filename: 'lodash.[contenthash].js',
                    },
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                        filename: 'default.[contenthash].js',
                    },
                },
            },
            runtimeChunk: {
                name: (entrypoint) => `runtime~${entrypoint.name}`,
            },
            minimize: isProd,
            minimizer: [
                new TerserPlugin({
                    minify: TerserPlugin.swcMinify,
                }),
            ],
        },
    };
};

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
    ].concat(
        isProd
            ? [new MiniCssExtractPlugin({ filename: '[contenthash].css', ignoreOrder: true })]
            : [],
    ),
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
    plugins: isProd ? [getBundleAnalyzerPlugin()] : [],
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
        publicPath: PUBLIC_PATH,
    },
});

const defaultAppConfig = (apps) => {
    const resolvePath = (app) => path.resolve(__dirname, '../packages/frontend/', app);

    return buildConfig([
        contextConfig(path.resolve(__dirname, '..')),
        defaultInOut(apps, resolvePath),
        fontConfig,
        svgConfig,
        cssConfig(),
        tsConfig(apps, resolvePath),
        htmlConfig(apps, resolvePath),
        copyConfig(),
        monacoConfig(),
        analyzerConfig(),
        imagesConfig,
        defaultDevServerConfig(apps),
        optimizationConfig(env),
    ]);
};

module.exports = {
    buildConfig,
    contextConfig,
    tsConfig,
    htmlConfig,
    defaultDevServerConfig,
    defaultInOut,
    defaultAppConfig,
};
