const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const env = process.env.NODE_ENV;
const DEV_NAME = 'development';
const PROD_NAME = 'production';
const ANALYZER_NAME = 'analyzer';
const E2E_NAME = 'e2e';
const isProd = [PROD_NAME, ANALYZER_NAME, E2E_NAME].includes(env);
const tag = isProd && process.env.TAG ? process.env.TAG : 'dev';
const PUBLIC_PATH = process.env.PUBLIC_PATH;
const ROOT_DIST = path.resolve(__dirname, '../dist');
const BUILD_PREFIX = process.env.BUILD_PREFIX === 'prod' || !isProd ? 'prod' : 'ms';

console.log('---ENV: ', env);
console.log('---PUBLIC_PATH: ', PUBLIC_PATH);
console.log('---ROOT_DIST: ', ROOT_DIST);
console.log('---BUILD_PREFIX: ', BUILD_PREFIX);
console.log('---TAG: ', tag);

function getResolve() {
    return {
        mainFields: ['browser', 'module', 'main'],
        extensions: ['.js', '.mjs', '.ts', '.tsx', '.json', '.ttf', '.woff2', '.svg'],
        fallback: {
            util: false,
        },
    };
}

function getCssLoader(isProd) {
    return {
        test: /\.css$/i,
        use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
        sideEffects: true,
    };
}

function getFontsLoader() {
    return {
        test: /\.(ttf|woff2)$/,
        type: 'asset/resource',
    };
}

function getSvgLoader() {
    return {
        test: /\.svg/,
        type: 'asset/source',
    };
}

function getTsLoader() {
    return {
        test: /\.tsx?$/i,
        loader: 'swc-loader',
        options: {
            jsc: {
                transform: {
                    react: {
                        runtime: 'automatic',
                    },
                },
                loose: true,
                target: 'esnext',
                keepClassNames: true,
            },
        },
    };
}

function getImagesLoader() {
    return {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
    };
}

function getTSCheckerPlugin(apps, resolvePathToApp) {
    const globalTypeFiles = path.resolve(__dirname, '../packages/frontend/**/global.d.ts');

    return new ForkTsCheckerPlugin({
        typescript: {
            configOverwrite: {
                include: apps.map(resolvePathToApp).concat(globalTypeFiles),
            },
        },
    });
}

function getHtmlWebpackPlugin(app, template, favicon) {
    return new HtmlWebpackPlugin({
        title: app,
        filename: `${app}.html`,
        chunks: [app],
        template,
        favicon,
    });
}

function getBundleAnalyzerPlugin() {
    return new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        logLevel: 'error',
    });
}

function getCopyConfigsPlugin() {
    return new CopyPlugin({
        patterns: [path.resolve(__dirname, '../configs/*')],
    });
}

function getCopy1x1Plugin() {
    return new CopyPlugin({
        patterns: [path.resolve(__dirname, '../assets/1x1.png')],
    });
}

function getCopyKeycloakFramePlugin() {
    return new CopyPlugin({
        patterns: [path.resolve(__dirname, '../assets/keycloak-sso-frame.html')],
    });
}

function getMonacoPlugin() {
    return new MonacoWebpackPlugin({
        languages: ['xml', 'json'],
    });
}

module.exports = {
    env,
    isProd,
    PROD_NAME,
    DEV_NAME,
    E2E_NAME,
    ROOT_DIST,
    PUBLIC_PATH,
    BUILD_PREFIX,
    getResolve,
    getTsLoader,
    getSvgLoader,
    getCssLoader,
    getFontsLoader,
    getImagesLoader,
    getTSCheckerPlugin,
    getHtmlWebpackPlugin,
    getBundleAnalyzerPlugin,
    getCopyConfigsPlugin,
    getCopy1x1Plugin,
    getMonacoPlugin,
    getCopyKeycloakFramePlugin,
};
