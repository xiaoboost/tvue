const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function resolve(dir = '') {
    return path.join(__dirname, '..', dir);
}

module.exports = {
    mode: 'development',
    entry: resolve('example/main.ts'),
    output: {
        path: resolve('example'),
        filename: 'build.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        mainFiles: ['index.ts'],
        alias: {
            tvue: resolve('src/index.ts'),
        },
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"',
        }),
        new webpack.HashedModuleIdsPlugin({
            hashFunction: 'sha256',
            hashDigest: 'hex',
            hashDigestLength: 6,
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/main.css',
        }),
    ],
};
