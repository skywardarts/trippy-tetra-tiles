import express from 'express';
import http from 'http';
import request from 'request';
import url from 'url';
import fs from 'fs';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config.web.js';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


class Server {
    constructor() {
        this.env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
        this.host = process.env.HOST ? process.env.HOST : '0.0.0.0';
        this.port = process.env.PORT ? process.env.PORT : 8080;
        this.events = [];
        this.clients = [];
        this.hostClient = null;
    }

    init() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = require('socket.io').listen(this.server);

        if (this.env === 'development') {
            webpackConfig.devtool = 'eval'; // Speed up incremental builds
            webpackConfig.entry['webapp'].unshift('webpack-hot-middleware/client?path=/__webpack_hmr');
            webpackConfig.output.publicPath = '/Build/Release/';
            webpackConfig.plugins.unshift(new webpack.HotModuleReplacementPlugin());
            webpackConfig.plugins.unshift(new webpack.NoErrorsPlugin());
            webpackConfig.module.loaders[0].query.presets.push('react-hmre');

            const compiler = webpack(webpackConfig);

            this.app.use(webpackDevMiddleware(compiler, {
                publicPath: webpackConfig.output.publicPath,
                stats: {
                    colors: true,
                    hash: false,
                    timings: true,
                    chunks: false,
                    chunkModules: false,
                    modules: false
                }
            }));

            this.app.use(webpackHotMiddleware(compiler, {
                hot: true,
                historyApiFallback: true
            }));
        }

        // Facebook Canvas needs to send a POST request
        this.app.post('/', (req, res, next) => {
            req.pipe(request.get('http://' + this.host + ':' + this.port + '/')).pipe(res);
        });

        // Web server
        this.app.use(express.static(__dirname + '/../App'));
    }

    start() {
        this.io.sockets.on('connection', (socket) => {
            this.onSocketConnect(socket);

            socket.on('disconnect', () => {
                this.onSocketDisconnect(socket);
            });
        });

        console.log('Open ' + this.host + ':' + this.port + ' on your browser.');
        console.log('Listening...');

        this.monitorHost();

        setInterval(() => {
            if (!this.hostClient) return console.log('No host');
            if (!this.hostClient.player) return console.log('Host has no player');

            console.log('Host: ', this.hostClient.player.id);
        }, 2000);

        this.server.listen(this.port, this.host, (err) => {
            if (err) { console.log(err); }

            console.info('==> Listening on port %s (env: ' + this.env + '). Open up http://0.0.0.0:%s/ in your browser.', this.port, this.port);
        });
    }

    setHost(client) {
        console.log('Setting host to player: ' + client.player.id);
        this.hostClient = client;
    }

    findNewHost() {
        if (this.clients.length > 0) {
            var i = getRandomInt(0, this.clients.length-1);
            var client = this.clients[i];

            // Make sure client had time to initialize the player
            if (client) {
                this.setHost(client);

                console.log('New host: ' + this.hostClient.player.id);
                this.io.sockets.emit('setHost', {player: this.hostClient.player});
            }
        }
    }

    getClientHost() {
        if (!this.clients.length) { return; }
        return this.clients.reduce((previousClient, currentClient) => { if (previousClient && previousClient.player.id === this.hostClient.player.id) { return previousClient; } else if (currentClient.player.id === this.hostClient.player.id) { return currentClient; }});
    }

    findClientBySocket(socket) {
        if (!this.clients.length) { return; }
        return this.clients.reduce((previousClient, currentClient) => { if (previousClient && previousClient.socket === socket) { return previousClient; } else if (currentClient.socket === socket) { return currentClient; }});
    }

    addClient(client) {
        console.log('Adding player: ' + client.player.id);
        this.clients.push(client);
    }

    removeClient(client) {
        console.log('Removing player: ' + client.player.id);

        this.clients.splice(this.clients.indexOf(client), 1);
    }

    fireEvent(socket, event) {
        socket.emit('events', {events: [event]});
    }

    fireAllPlayers(event) {
        this.io.sockets.emit('events', {events: [event]});
    }

    parseEvent(socket, event) {
        if (event.key === 'newPlayer') {
            console.log('Handshaking...');

            this.addClient({socket: socket, player: event.info.player});

            // If it's the first client or there's no hosts, lets set it as the new host
            if (!this.hostClient) {
                this.setHost(this.clients[this.clients.length-1]);
                console.log('New host: ' + this.hostClient.player.id);
            }

            this.fireEvent(socket, {key: 'setHost', info: {player: this.hostClient.player}});
        } else if (event.key === 'this.findNewHost') {
            console.log("Finding new host....");
            var client = this.findClientBySocket(socket);
            this.removeClient(client);
            this.hostClient = null;
            this.findNewHost();
        } else {
            //socket.broadcast.emit(event.key, event.info);
        }
    }

    onSocketConnect(socket) {
        console.log('New connection.. waiting for handshake');

        // TODO: give them 10 seconds to identify as a newPlayer, or cut them off

        socket.on('events', (data) => {
            //console.log('Incoming events: ' + data);
            data = JSON.parse(data);

            data.events.forEach((event) => { this.parseEvent(socket, event); });

            socket.broadcast.emit('events', data);
        });
    }

    onSocketDisconnect(socket) {
        var client = this.findClientBySocket(socket);

        if (!client) { return; }

        this.removeClient(client);

        // If this client was the host,
        // and there's at least one more client connected,
        // lets choose a new random host,
        // and broadcast it to everybody
        if (client.player.id === this.hostClient.player.id) {
            this.hostClient = null;
            this.findNewHost();
        }

        if (this.clients.length === 0) {
            this.hostClient = null;
        }

        this.fireAllPlayers({key: 'playerLeave', info: {player: client.player}});
    }

    // Monitor the clients to make sure they are still defined
    monitorHost() {
        if (!this.hostClient) {
            this.findNewHost();
        }

        setTimeout(this.monitorHost.bind(this), 50);
    }
}

export default Server;
