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
import express from 'express';
import * as XLSX from 'xlsx';
import fs from 'fs-extra';
import { Storage } from '../fetchAndStore/Storage.js';
import { downsample } from 'downsample-lttb-ts';
/** Supported download formats */
export const downloadFormats = ['csv', 'xlsx', 'json'];
/**
 * Starts http server. Servers all files
 */
export function startWebServer() {
    return __awaiter(this, void 0, void 0, function* () {
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
            var _a;
            res.setHeader('Content-Type', 'application/json');
            let data = storage.data;
            const from = getAsNumber(req.query.from);
            const samples = (_a = getAsNumber(req.query.samples)) !== null && _a !== void 0 ? _a : 200;
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
        app.get('/backup', (_, res) => __awaiter(this, void 0, void 0, function* () { return backup(res, storage); }));
        app.use('/', express.static('./site'));
        app.get('/getMinDate', (_, res) => res.send(String(storage.getMinDate())));
        app.listen(port, () => {
            console.info('Webserver active on Port ' + port);
        });
    });
}
/**
 * Handler for getData endpoint
 *
 * @param req Request
 * @param res Response
 * @param storage Storage object
 */
function getData(req, res, storage) {
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
function getDataSeries(req, res, storage) {
    var _a;
    const from = getAsNumber(req.query.from);
    const to = getAsNumber(req.query.to);
    const samples = (_a = getAsNumber(req.query.samples)) !== null && _a !== void 0 ? _a : 200;
    res.json(toSeries(storage.getData(from, to), samples));
}
/**
 * Handler for download endpoint
 *
 * @param req Request
 * @param res Response
 * @param storage Storage object
 */
function download(req, res, storage) {
    var _a, _b;
    const from = (_a = getAsNumber(req.query.from)) !== null && _a !== void 0 ? _a : Date.now() - 24 * 60 * 60 * 1000;
    const to = (_b = getAsNumber(req.query.to)) !== null && _b !== void 0 ? _b : Date.now();
    const formatString = (typeof (req.query.format) === 'string' ? req.query.format : 'json');
    const format = downloadFormats.includes(formatString) ? formatString : 'json';
    // Force download, prevent show in browser
    switch (format) {
        case 'csv':
            res.setHeader('Content-Type', 'text/csv');
            res.write('timestamp;input0;input1;input2;input3;output0;output1;boot;state\n');
            for (const row of storage.getDataIterator(from, to)) {
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
            for (const row of storage.getDataIterator(from, to)) {
                if (first) {
                    res.write(JSON.stringify(row));
                    first = false;
                }
                else {
                    res.write(',' + JSON.stringify(row));
                }
            }
            res.write(']');
            res.end();
            break;
        }
        case 'xlsx': {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            const data = storage.getRawData(from, to);
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Dates');
            const wb = XLSX.write(workbook, {
                bookType: 'xlsx',
                type: 'buffer',
            });
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
function backup(res, storage) {
    return __awaiter(this, void 0, void 0, function* () {
        const filename = yield storage.getBackupFile();
        res.setHeader('Content-Type', 'application/octet-stream');
        res.sendFile(filename);
        yield fs.remove(filename);
    });
}
/**
 * Returns either a numeric representation of the given query parameter or null if not available / possible
 *
 * @param value Value to test
 * @returns Either a valid number or null
 */
function getAsNumber(value) {
    if (typeof (value) !== 'string') {
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
function toSeries(data, samples) {
    const retVal = {
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
        retVal.input0 = downsample({ series: retVal.input0, threshold: samples });
        retVal.input1 = downsample({ series: retVal.input1, threshold: samples });
        retVal.input2 = downsample({ series: retVal.input2, threshold: samples });
        retVal.input3 = downsample({ series: retVal.input3, threshold: samples });
        retVal.out0 = downsample({ series: retVal.out0, threshold: samples });
        retVal.out1 = downsample({ series: retVal.out1, threshold: samples });
    }
    return retVal;
}
