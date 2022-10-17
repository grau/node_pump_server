/**
 * @file Webserver to provide data
 */

import express from 'express';
import type { Request, Response } from 'express';

import { Storage } from '../fetchAndStore/Storage.js';
import type { IStorageData } from '../interfaces/IData.js';
import type { ISeriesData } from '../interfaces/IStorage.js';
import { downsample } from 'downsample-lttb-ts';

/**
 * Starts http server. Servers all files
 */
export async function startWebServer(): Promise<void> {
    const storage = Storage.getInstance();
    const app = express();
    const port = 3000;

    app.get('/getDataCache', (req, res) => {
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

    app.use('/', express.static('./site'));


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
function getDataSeries(req: Request, res: Response, storage: Storage): void {
    const from = getAsNumber(req.query.from);
    const to = getAsNumber(req.query.to);
    const samples = getAsNumber(req.query.samples) ?? 200;
    res.json(toSeries(storage.getData(from, to), samples));
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
