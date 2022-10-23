/**
 * @file Webserver to provide data
 */

import express from 'express';
import type { Request, Response } from 'express';
import { downsample } from 'downsample-lttb-ts';
import * as XLSX from 'xlsx';
import fs from 'fs-extra';

import { Storage } from '../fetchAndStore/storage-mysql.js';
import { System } from '../fetchAndStore/system.js';
import type { IStorageData } from '../interfaces/IData.js';
import type { ISeriesData } from '../interfaces/IStorage.js';

/** Supported download formats */
export const downloadFormats = ['csv', 'xlsx', 'json'] as const;
/**
 *
 */
export type TDownloadFormats = typeof downloadFormats[number];

/**
 * Starts http server. Servers all files
 */
export async function startWebServer(): Promise<void> {
    const storage = await Storage.getInstance();
    const system = System.getInstance();
    const app = express();
    const port = 3000;

    app.get('/getDataCache', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        let data = storage.data;
        const from = getAsNumber(req.query.from);
        if (from !== null) {
            data = data.filter((data) => data.timestamp > from);
        }
        res.json(data);
    });

    app.get('/getDataCacheSeries', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        let data = storage.data;
        const from = getAsNumber(req.query.from);
        const samples = getAsNumber(req.query.samples) ?? 200;
        if (from !== null) {
            data = data.filter((data) => data.timestamp > from);
        }
        res.json(toSeries(data, samples));
    });

    app.get('/getErrorCache', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        let error = storage.error;
        const from = getAsNumber(req.query.from);
        if (from !== null) {
            error = error.filter((error) => error.timestamp > from);
        }
        res.json(error);
    });

    app.get('/getData', (req, res) => getData(req, res, storage));

    app.get('/getDataSeries', (req, res) => getDataSeries(req, res, storage));

    app.get('/download', (req, res) => download(req, res, storage));

    app.get('/backup', async (_, res) => backup(res, storage));

    app.use('/', express.static('./site'));

    app.use('/system', (_, res) => res.json(system.data));


    app.get('/getMinDate', (_, res) => res.send(String(storage.getMinDate())));

    app.listen(port, () => {
        console.info('Webserver active on Port ' + port);
    });
}

/**
 * Handler for getData endpoint
 *
 * @param req Request
 * @param res Response
 * @param storage Storage object
 */
function getData(req: Request, res: Response, storage: Storage): void {
    const from = getAsNumber(req.query.from);
    const to = getAsNumber(req.query.to);
    res.json(storage.getData(from, to));
}

/**
 * Handler for getData endpoint
 *
 * @param req Request
 * @param res Response
 * @param storage Storage object
 */
async function getDataSeries(req: Request, res: Response, storage: Storage): Promise<void> {
    const from = getAsNumber(req.query.from);
    const to = getAsNumber(req.query.to);
    const samples = getAsNumber(req.query.samples) ?? 200;
    res.json(toSeries(await storage.getData(from, to), samples));
}

/**
 * Handler for download endpoint
 *
 * @param req Request
 * @param res Response
 * @param storage Storage object
 */
async function download(req: Request, res: Response, storage: Storage): Promise<void> {
    const from = getAsNumber(req.query.from) ?? Date.now() - 24 * 60 * 60 * 1000;
    const to = getAsNumber(req.query.to) ?? Date.now();
    const formatString = (typeof(req.query.format) === 'string' ? req.query.format : 'json') as TDownloadFormats;
    const format = downloadFormats.includes(formatString) ? formatString : 'json';
    // Force download, prevent show in browser
    switch (format) {
    case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.write('timestamp;input0;input1;input2;input3;output0;output1;boot;state\n');
        for (const row of await storage.getDataIterator(from, to)) {
            res.write([row.timestamp, row.input0, row.input1, row.input2, row.input3,
                row.output0, row.output1, row.boot, row.state]
                .join(';') + '\n');
        }
        res.end();
        break;
    case 'json': {
        // We don't want the browser to open the result - therefore we tag it as octet stream to force download.
        res.setHeader('Content-Type', 'application/octet-stream');
        res.write('[');
        let first = true;
        for (const row of await storage.getDataIterator(from, to)) {
            if (first) {
                res.write(JSON.stringify(row));
                first = false;
            } else {
                res.write(',' + JSON.stringify(row));
            }
        }
        res.write(']');
        res.end();
        break;
    }
    case 'xlsx': {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        const data = await storage.getRawData(from, to);
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dates');
        const wb = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'buffer',
        }) as ArrayBuffer;
        res.send(wb);
    }
    }
}


/**
 * Handler for backup endpoint
 *
 * @param res Response
 * @param storage Storage object
 */
async function backup(res: Response, storage: Storage): Promise<void> {
    const filename = await storage.getBackupFile();
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(filename);
    await fs.remove(filename);
}

/**
 * Returns either a numeric representation of the given query parameter or null if not available / possible
 *
 * @param value Value to test
 * @returns Either a valid number or null
 */
function getAsNumber(value: Request['query']['from']): number | null {
    if (typeof(value) !== 'string') {
        return null;
    }
    const num = parseInt(value);
    return isNaN(num) ? null : num;
}

/**
 * Converts the given storage object in an array of timeseries.
 * Downsamples the result if necessary
 *
 * @param data Data to transform
 * @param samples Max number of samples to return
 * @returns Object containing timeseries
 */
function toSeries(data: IStorageData[], samples: number): ISeriesData {
    const retVal: ISeriesData = {
        input0: [],
        input1: [],
        input2: [],
        input3: [],
        out0: [],
        out1: [],
    };

    for (const row of data) {
        retVal.input0.push([row.timestamp, row.input[0].val]);
        retVal.input1.push([row.timestamp, row.input[1].val]);
        retVal.input2.push([row.timestamp, row.input[2].val]);
        retVal.out0.push([row.timestamp, row.output[0].val]);
        retVal.out1.push([row.timestamp, row.output[1].val]);
    }

    if (data.length > samples) {
        retVal.input0 = downsample({series: retVal.input0, threshold: samples}) as [number, number][];
        retVal.input1 = downsample({series: retVal.input1, threshold: samples}) as [number, number][];
        retVal.input2 = downsample({series: retVal.input2, threshold: samples}) as [number, number][];
        retVal.input3 = downsample({series: retVal.input3, threshold: samples}) as [number, number][];
        retVal.out0 = downsample({series: retVal.out0, threshold: samples}) as [number, number][];
        retVal.out1 = downsample({series: retVal.out1, threshold: samples}) as [number, number][];
    }
    return retVal;
}
