/**
 * @file Api connector to get data
 * @todo Move this code to a service worker
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
import { db } from './database.js';
import delay from 'delay';
/**
 * Update loop fetching new data from server - for all infinity.
 */
export function fetchLoop() {
    return __awaiter(this, void 0, void 0, function* () {
        connectWebsocket()
            .catch((err) => {
            console.warn('Update loop crashed', { err });
            // eslint-disable-next-line no-alert
            alert('Update loop ist abgestürtzt! Bitte die Seite neu laden!');
        });
        console.time('Fetch all data');
        yield updateFileIndex();
        for (const fileIndex of yield db.getFileIndex()) {
            if (fileIndex.fetched < fileIndex.lastChanged) {
                const { filename } = fileIndex;
                console.time('Fetch file' + filename);
                yield storeFile(filename);
                yield db.setFileIndex(filename);
                console.timeEnd('Fetch file' + filename);
            }
            else {
                console.log('File already in storage. Skipping', { fileIndex });
            }
        }
        console.timeEnd('Fetch all data');
    });
}
/**
 * Websocket client connection
 */
function connectWebsocket() {
    return __awaiter(this, void 0, void 0, function* () {
        for (;;) {
            console.log('Connecting websocket.');
            const socket = new WebSocket('ws://localhost:3000');
            socket.addEventListener(('message'), (message) => {
                const data = JSON.parse(message.data);
                db.addData([data])
                    .catch((err) => console.warn('Failed to store data!', { err, data, message }));
            });
            yield new Promise((resolve) => {
                socket.addEventListener('close', (event) => {
                    console.warn('Socket closed. Retry ...', { event });
                    resolve();
                });
                socket.addEventListener('error', (event) => {
                    console.warn('Socket crashed. Retry ...', { event });
                    resolve();
                });
            });
            yield delay(2000);
        }
    });
}
/**
 * Fetches the index from server
 *
 * @returns All index files
 */
function updateFileIndex() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = '/index';
        const content = yield (yield fetch(url)).text();
        const indexFiles = content
            .split('\n')
            .filter((line) => line.length > 0)
            .map((line) => line.split(';'))
            .map((line) => ({ filename: line[0], timestamp: parseInt(line[1]) }));
        console.log('Got index', { indexFiles });
        yield db.updateFileIndex(indexFiles);
    });
}
/**
 * Fetches the given file from server and puts it in database
 *
 * @param filename Filename to fetch
 */
function storeFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = '/data/' + filename;
        const content = yield (yield fetch(url)).text();
        const rows = content
            .split('\n')
            .filter((line) => line.length > 0);
        if (filename.match(/-error\.csv/)) {
            const errors = rows
                .map(parseErrorLine);
            yield db.addError(errors);
        }
        else {
            const data = rows
                .map(parseDataLine);
            yield db.addData(data);
        }
    });
}
/**
 * Parses a single error line
 *
 * @param line Line to parse
 * @returns error object
 */
function parseErrorLine(line) {
    const [timestamp, data, error, message] = line.split(';');
    return {
        timestamp: parseInt(timestamp),
        data,
        error: error,
        message,
    };
}
/**
 * Parses a single data line
 *
 * @param line Line to parse
 * @returns data object
 */
function parseDataLine(line) {
    const [timestamp, input0, input1, input2, input3, output0, output1, boot, state] = line.split(';');
    return {
        timestamp: parseInt(timestamp),
        input: [
            { id: 0, val: parseInt(input0) },
            { id: 1, val: parseInt(input1) },
            { id: 2, val: parseInt(input2) },
            { id: 3, val: parseInt(input3) },
        ],
        output: [
            { id: 0, val: parseInt(output0) },
            { id: 1, val: parseInt(output1) },
        ],
        boot: boot === '1',
        state: parseInt(state),
    };
}
