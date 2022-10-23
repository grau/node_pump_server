/**
 * @file Entry point for gathering and storing data application
 */

import delay from 'delay';
import { SerialPort, ReadlineParser } from 'serialport';

import { Storage } from './storage-mysql.js';
import type { IStorageData } from '../interfaces/IData.js';

/**
 * Main queue
 */
export async function mainQueue(): Promise<never> {
    const storage = await Storage.getInstance();
    // eslint-disable-next-line no-constant-condition
    while (true) {
        console.info('Connecting to port');
        await new Promise<void>((resolve) => {
            listenToArduino(storage, resolve)
                .catch((err) => {
                    console.warn('listenToArduino crashed!', err);
                    resolve();
                });
        });
        await delay(5000);
    }
}

/**
 * Opens arduino port, Pipes data to storage.
 * Calls callback on error
 *
 * @param storage Storage function to pipe data to
 * @param error Called if port crashes/closes
 */
async function listenToArduino(storage: Storage, error: () => void): Promise<void> {
    const port = new SerialPort({
        baudRate: 115200,
        path: '/dev/ttyUSB0',
    });

    const parser = new ReadlineParser();
    port.pipe(parser);
    parser.on('data', (data: string) => storage.storeDataLine(data, Date.now()));

    port.on('pause', () => {
        storage.storeError('port', 'Pause', Date.now())
            .catch((err) => console.warn('Failed to store pause error', {err}));
    });
    port.on('close', () => {
        storage.storeError('port', 'Close', Date.now())
            .catch((err) => console.warn('Failed to store close error', {err}));
        error();
    });
    port.on('error', () => {
        storage.storeError('port', 'Close', Date.now())
            .catch((err) => console.warn('Failed to store error error', {err}));
        error();
    });
    parser.on('error', () => {
        storage.storeError('port', 'Close', Date.now())
            .catch((err) => console.warn('Failed to store parser error', {err}));
        error();
    });
}

/**
 * Just a simple test function
 */
export async function writeTestData(): Promise<never> {
    const storage = await Storage.getInstance();

    console.log('Pre-push some values');
    for (let timestamp = Date.now() - (2000 * 1800); timestamp < Date.now(); timestamp+=2000) {
        await storage.storeDataLine(getTestdata(timestamp), timestamp);
    }

    console.log('Starting base system');
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const timestamp = Date.now();
        await storage.storeDataLine(getTestdata(timestamp), timestamp);
        await delay(2000);
    }
}

/**
 * A single testdata element
 *
 * @param timestamp Timestamp to generate testdata for
 * @returns Test dataset
 */
function getTestdata(timestamp: number): string {
    const data: IStorageData = {
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
