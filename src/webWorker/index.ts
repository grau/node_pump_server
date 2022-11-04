/**
 * @file Api connector to get data
 * @todo Move this code to a service worker
 */

import { db } from '../website/database.js';
import type { IStorageData, IStorageError, TError } from '../interfaces/IData.js';
import delay from 'delay';

/**
 * Update loop fetching new data from server - for all infinity.
 */
export async function fetchLoop(): Promise<void> {
    connectWebsocket()
        .catch((err) => {
            console.warn('Update loop crashed', {err});
            // eslint-disable-next-line no-alert
            alert('Update loop ist abgestürtzt! Bitte die Seite neu laden!');
        });
    console.time('Fetch all data');
    await updateFileIndex();
    for (const fileIndex of await db.getFileIndex()) {
        if (fileIndex.fetched < fileIndex.lastChanged) {
            const {filename} = fileIndex;
            console.time('Fetch file' + filename);
            await storeFile(filename);
            await db.setFileIndex(filename);
            console.timeEnd('Fetch file' + filename);
        } else {
            console.log('File already in storage. Skipping', {fileIndex});
        }
    }
    console.timeEnd('Fetch all data');
}

/**
 * Websocket client connection
 */
async function connectWebsocket(): Promise<never> {
    for (;;) {
        console.log('Connecting websocket.');
        const socket = new WebSocket('ws://localhost:3000');
        socket.addEventListener(('message'), (message) => {
            const data = JSON.parse(message.data) as IStorageData;
            db.addData([data])
                .catch((err) => console.warn('Failed to store data!', {err, data, message}));
        });
        await new Promise<void>((resolve) => {
            socket.addEventListener('close', (event) => {
                console.warn('Socket closed. Retry ...', {event});
                resolve();
            });
            socket.addEventListener('error', (event) => {
                console.warn('Socket crashed. Retry ...', {event});
                resolve();
            });
        });
        await delay(2000);
    }
}

/**
 * Fetches the index from server
 *
 * @returns All index files
 */
async function updateFileIndex(): Promise<void> {
    const url = '/index';
    const content = await (await fetch(url)).text();
    const indexFiles = content
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => line.split(';'))
        .map((line) => ({filename: line[0], timestamp: parseInt(line[1])}));
    console.log('Got index', {indexFiles});
    await db.updateFileIndex(indexFiles);
}

/**
 * Fetches the given file from server and puts it in database
 *
 * @param filename Filename to fetch
 */
async function storeFile(filename: string): Promise<void> {
    const url = '/data/' + filename;
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

fetchLoop()
    .catch((err) => console.warn('Webworker crashed', {err}));
