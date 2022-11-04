/**
 * @file Webserver to provide data
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from 'path';
import fs from 'fs-extra';
import express from 'express';
import { WebSocketServer } from 'ws';
import { Storage } from '../fetchAndStore/storage-csv.js';
import { dataStorage } from '../config.js';
/** Supported download formats */
export const downloadFormats = ['csv', 'xlsx', 'json'];
/**
 * Starts http server. Servers all files
 */
export function startWebServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const storage = yield Storage.getInstance();
        const app = express();
        const port = 3000;
        app.use('/', express.static('./site'));
        app.use('/data', express.static(dataStorage));
        app.get('/index', (_, res) => sendIndex(res));
        const wsServer = new WebSocketServer({ noServer: true });
        wsServer.on('connection', (socket) => {
            const listener = storage.addListeners((data) => socket.send(JSON.stringify(data)));
            socket.addEventListener('close', () => {
                storage.removeListeners(listener);
            });
        });
        const server = app.listen(port, () => {
            console.info('Webserver active on Port ' + port);
        });
        server.on('upgrade', (request, socket, head) => {
            wsServer.handleUpgrade(request, socket, head, socket => {
                wsServer.emit('connection', socket, request);
            });
        });
    });
}
/**
 * Send file index
 *
 * @param res Express response
 */
function sendIndex(res) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield fs.readdir(dataStorage);
        for (const file of files) {
            const stat = yield fs.stat(path.join(dataStorage, file));
            res.write(file + ';' + String(stat.mtime.getTime()) + '\n');
        }
        res.end();
    });
}
