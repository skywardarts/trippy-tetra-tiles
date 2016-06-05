var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        'webapp': ['./App/index.web.js'],
        // We don't need this, thought it would be a nice placeholder
        // 'index.ios': ['./app/index.ios.js']
    },
    output: {
        path: __dirname + '/App/Build/Release',
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.json']
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                loader: 'babel',
                include: [path.join(__dirname + '/App'), path.join(__dirname + '/node_modules/react-native-extended-stylesheet')],
                query: {
                    cacheDirectory: true,
                    plugins: [],
                    presets: ['react', 'es2015', 'stage-0']
                }
            },
            {
                test: /\.css$/,
                include: path.join(__dirname + '/App'),
                loaders: [
                    'raw'
                ]
            },
            {
                test: /\.json$/,
                include: path.join(__dirname + '/'), // Thanks cheerio :-/
                loader: 'json-loader'
            },
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(/^(react-native)$/)
    ]
};
