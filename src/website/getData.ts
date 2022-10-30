/**
 * @file Api connector to get data
 */

import delay from 'delay';
import type { IStorageData, IStorageError, TError } from '../interfaces/IData.js';
import { db } from './database.js';

/**
 * Update loop fetching new data from server - for all infinity.
 */
export async function fetchLoop(): Promise<never> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        await updateFileIndex();
        for (const filename of await db.getNextFilenames()) {
            console.log('Fetching data file ' + filename);
            await storeFile(filename);
            await db.setFileIndex(filename);
            console.log('... fetched');
        }
        console.log('Waiting for new files');
        await delay(10000);
    }
}

/**
 * Fetches the index from server
 *
 * @returns All index files
 */
async function updateFileIndex(): Promise<void> {
    const url = '/data/index.txt';
    const content = await (await fetch(url)).text();
    const filenames = content
        .split('\n')
        .filter((line) => line.length > 0);
    await db.updateFileIndex(filenames);
}

/**
 * Fetches the given file from server and puts it in database
 *
 * @param filename Filename to fetch
 */
async function storeFile(filename: string): Promise<void> {
    const url = '/' + filename;
    const content = await (await fetch(url)).text();
    const rows = content
        .split('\n')
        .filter((line) => line.length > 0);

    if (filename.match(/-error\.csv/)) {
        const errors = rows
            .map(parseErrorLine);
        await db.addError(errors);
    } else {
        const data = rows
            .map(parseDataLine);
        await db.addData(data);
    }
}

/**
 * Parses a single error line
 *
 * @param line Line to parse
 * @returns error object
 */
function parseErrorLine(line: string): IStorageError {
    const [timestamp, data, error, message] = line.split(';');
    return {
        timestamp: parseInt(timestamp),
        data,
        error: error as TError,
        message,
    };
}

/**
 * Parses a single data line
 *
 * @param line Line to parse
 * @returns data object
 */
function parseDataLine(line: string): IStorageData {
    const [timestamp, input0, input1, input2, input3, output0, output1, boot, state] = line.split(';');
    return {
        timestamp: parseInt(timestamp),
        input: [
            {id: 0, val: parseInt(input0)},
            {id: 1, val: parseInt(input1)},
            {id: 2, val: parseInt(input2)},
            {id: 3, val: parseInt(input3)},
        ],
        output: [
            {id: 0, val: parseInt(output0)},
            {id: 1, val: parseInt(output1)},
        ],
        boot: boot === '1',
        state: parseInt(state),
    };
}
