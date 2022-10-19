/**
 * @file Entry point for gathering and storing data application
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
import delay from 'delay';
import { SerialPort, ReadlineParser } from 'serialport';
import { Storage } from './storage.js';
/**
 * Main queue
 */
export function mainQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        const storage = Storage.getInstance();
        // eslint-disable-next-line no-constant-condition
        while (true) {
            console.info('Connecting to port');
            yield new Promise((resolve) => {
                listenToArduino(storage, resolve);
            });
            yield delay(5000);
        }
    });
}
/**
 * Opens arduino port, Pipes data to storage.
 * Calls callback on error
 *
 * @param storage Storage function to pipe data to
 * @param error Called if port crashes/closes
 */
function listenToArduino(storage, error) {
    const port = new SerialPort({
        baudRate: 115200,
        path: '/dev/ttyUSB0',
    });
    const parser = new ReadlineParser();
    port.pipe(parser);
    parser.on('data', (data) => storage.storeDataLine(data, Date.now()));
    port.on('pause', () => {
        storage.storeError('port', 'Pause', Date.now());
    });
    port.on('close', () => {
        storage.storeError('port', 'Close', Date.now());
        error();
    });
    port.on('error', () => {
        storage.storeError('port', 'Close', Date.now());
        error();
    });
    parser.on('error', () => {
        storage.storeError('port', 'Close', Date.now());
        error();
    });
}
/**
 * Just a simple test function
 */
export function writeTestData() {
    return __awaiter(this, void 0, void 0, function* () {
        const storage = Storage.getInstance();
        console.log('Pre-push some values');
        for (let timestamp = Date.now() - (2000 * 1800); timestamp < Date.now(); timestamp += 2000) {
            storage.storeDataLine(getTestdata(timestamp), timestamp);
        }
        console.log('Starting base system');
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const timestamp = Date.now();
            storage.storeDataLine(getTestdata(timestamp), timestamp);
            yield delay(2000);
        }
    });
}
/**
 * A single testdata element
 *
 * @param timestamp Timestamp to generate testdata for
 * @returns Test dataset
 */
function getTestdata(timestamp) {
    const data = {
        timestamp,
        input: [],
        output: [],
        boot: false,
        state: 0,
    };
    for (let id = 0; id < 4; id++) {
        data.input.push({
            id,
            val: Math.sin(id + timestamp / 4000),
        });
    }
    for (let id = 0; id < 2; id++) {
        data.output.push({
            id,
            val: Math.sin(id + timestamp / 4000) > 0 ? 1 : 0,
        });
    }
    return JSON.stringify(data);
}
