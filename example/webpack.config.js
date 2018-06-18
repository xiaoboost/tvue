const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'tslint-loader',
                enforce: 'pre',
                options: {
                    typeCheck: true,
                    emitErrors: true,
                    // relative to the project root directory
                    configFile: './tslint.json',
                    tsConfigFile: './example/tsconfig.json',
                    include: [resolve('example'), resolve('src')],
                    formattersDirectory: 'node_modules/tslint-loader/formatters/',
                },
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    transpileOnly: false,
                    configFile: resolve('example/tsconfig.json'),
                },
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
            filename:'css/main.css',
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: resolve('example/index.html'),
            inject: true,
        }),
    ],
};
