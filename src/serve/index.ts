/**
 * @file Webserver to provide data
 */

import path from 'path';
import fs from 'fs-extra';
import os from 'os';

import checkDiskSpace from 'check-disk-space';
import express from 'express';
import { WebSocketServer } from 'ws';

import type { Request, Response } from 'express';
import type { ISystemData } from '../interfaces/ISystemData';

import {Storage} from '../fetchAndStore/storage-csv.js';
import {dataStorage} from '../config.js';
import {initCpuInfoUpdater, cpuTimes } from './cpuInfo.js';
import {__dirname} from '../config.js';

/**
 * Starts http server. Servers all files
 */
export async function startWebServer(): Promise<void> {
    const storage = await Storage.getInstance();
    const app = express();
    const port = 80;
    initCpuInfoUpdater();

    app.use('/', express.static(path.join(__dirname, '/site')));
    app.use('/data', express.static(dataStorage));
    app.get('/index', (_, res) => sendIndex(res));
    app.get('/csv', (req: Request, res: Response) => sendCsv(req, res, storage));
    app.get('/system', (_: Request, res: Response) => sendSystemData(res, storage));

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
}

/**
 * Send file index
 *
 * @param res Express response
 */
async function sendIndex(res: Response): Promise<void> {
    const files = await fs.readdir(dataStorage);
    for (const file of files) {
        const stat = await fs.stat(path.join(dataStorage, file));
        res.write(file + ';' + String(stat.mtime.getTime()) + '\n');
    }
    res.end();
}

/**
 * Send a csv file
 *
 * @param req Express request
 * @param res Express response
 * @param storage Storage object
 */
async function sendCsv(req: Request, res: Response, storage: Storage): Promise<void> {
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
    await storage.pipeDataCsv(from, to, res);
    res.end();
}



/**
 * Gather some system data and write it to array
 *
 * @param res Express response
 * @param storage Storage object
 */
async function sendSystemData(res: Response, storage: Storage): Promise<void> {
    const dbSize = await storage.getDbSize();
    const systemData: ISystemData = {
        timestamp: Date.now(),
        diskSpace: await checkDiskSpace('/'),
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
}
