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
import os from 'os';
import checkDiskSpace from 'check-disk-space';
import express from 'express';
import { WebSocketServer } from 'ws';
import { Storage } from '../fetchAndStore/storage-csv.js';
import { dataStorage } from '../config.js';
import { initCpuInfoUpdater, cpuTimes } from './cpuInfo.js';
import { __dirname } from '../config.js';
/**
 * Starts http server. Servers all files
 */
export function startWebServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const storage = yield Storage.getInstance();
        const app = express();
        const port = 3000;
        const staticSiteContent = path.join(__dirname, '..', '..', '/site');
        initCpuInfoUpdater();
        console.log('Serving static content from ' + staticSiteContent);
        app.use('/', express.static(staticSiteContent));
        app.use('/data', express.static(dataStorage));
        app.get('/index', (_, res) => sendIndex(res));
        app.get('/csv', (req, res) => sendCsv(req, res, storage));
        app.get('/system', (_, res) => sendSystemData(res, storage));
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
/**
 * Send a csv file
 *
 * @param req Express request
 * @param res Express response
 * @param storage Storage object
 */
function sendCsv(req, res, storage) {
    return __awaiter(this, void 0, void 0, function* () {
        const fromString = req.query.from;
        const toString = req.query.to;
        if (typeof fromString !== 'string' || typeof toString !== 'string') {
            res.status(500);
            res.send('err');
            return;
        }
        const from = parseInt(fromString);
        const to = parseInt(toString);
        if (isNaN(from) || isNaN(to)) {
            res.status(500);
            res.send('err');
            return;
        }
        res.setHeader('content-type', 'text/csv');
        yield storage.pipeDataCsv(from, to, res);
        res.end();
    });
}
/**
 * Gather some system data and write it to array
 *
 * @param res Express response
 * @param storage Storage object
 */
function sendSystemData(res, storage) {
    return __awaiter(this, void 0, void 0, function* () {
        const dbSize = yield storage.getDbSize();
        const systemData = {
            timestamp: Date.now(),
            diskSpace: yield checkDiskSpace('/'),
            cpuTimes: cpuTimes,
            dbSize,
            mem: {
                total: os.totalmem(),
                free: os.freemem(),
            },
            uptime: os.uptime(),
        };
        res.setHeader('content-type', 'application/json');
        res.send(JSON.stringify(systemData));
    });
}
