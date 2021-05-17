const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const distFolder = path.join(__dirname, 'dist');
const sourceFolder = path.join(__dirname, 'src');

module.exports = (args) => {
    const isDevelopment = args.development === true;
    const port = args.port || 8080;
    const sourceMap = isDevelopment;
    const prodCssLoaders = [
        {
            loader: 'file-loader',
            options: {
                name: '[name].[contenthash:8].css',
            },
        },
        { loader: 'extract-loader' },
    ];
    const devCssLoaders = [{ loader: 'style-loader' }];

    return {
        mode: isDevelopment ? 'development' : 'production',
        devtool: isDevelopment ? 'eval' : false,
        entry: path.join(sourceFolder, 'index.js'),
        output: {
            filename: isDevelopment ? '[name].bundle.js' : '[name].[contenthash:8].js',
            path: distFolder,
            clean: true,
        },
        devServer: {
            contentBase: distFolder,
            hot: true,
            hotOnly: true,
            https: true,
            port,
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                'babel-plugin-transform-redom-jsx',
                                [
                                    '@babel/transform-react-jsx',
                                    {
                                        pragma: 'el',
                                    },
                                ],
                            ],
                        },
                    },
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ico)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'assets/',
                            },
                        },
                    ],
                },
                {
                    test: /\.s?[a|c]ss$/,
                    use: (isDevelopment ? devCssLoaders : prodCssLoaders).concat([
                        { loader: 'css-loader' },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        require('postcss-flexbugs-fixes'),
                                        [
                                            require('postcss-preset-env'),
                                            {
                                                autoprefixer: {
                                                    flexbox: 'no-2009',
                                                },
                                                stage: 3,
                                            },
                                        ],
                                        require('postcss-normalize')(),
                                    ],
                                },
                                sourceMap,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                implementation: require('sass'),
                                webpackImporter: false,
                                sassOptions: {
                                    includePaths: ['./node_modules'],
                                },
                                sourceMap,
                            },
                        },
                    ]),
                },
            ],
        },
        plugins: [new HtmlWebpackPlugin({ inject: 'body' })],
        optimization: {
            splitChunks: {
                chunks: 'all',
                name: isDevelopment
                    ? (module, chunks, cacheGroupKey) => {
                          const moduleFileName = module
                              .identifier()
                              .split('/')
                              .reduceRight((item) => item);
                          const allChunksNames = chunks.map((item) => item.name).join('~');
                          return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
                      }
                    : false,
            },
        },
    };
};
