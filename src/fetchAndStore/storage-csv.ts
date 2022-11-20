/**
 * @file Stores data. THis is a pure CSV-File based version
 */

import path from 'path';
import fs from 'fs-extra';
import TSON from 'typescript-json';
import readline from 'readline';

import type * as stream from 'node:stream';


import { dataStorage } from '../config.js';
import type { IStorageData, IStorageError } from '../interfaces/IData.js';

/** Name of index file containing a list of all files */
const indexFile = path.join(dataStorage, 'index.csv');

/** Index entry */
export interface IIndex {
    /** Index filename */
    filename: string;
    /** Index timestamp */
    timestamp: number;
}

/** Number to dividde timestamp by for storage */
const timestampDivider = 1000 * 1000 * 100;

/**
 * Central storage class for writing/reading data
 *
 * @todo Add ringbuffer logic for data and error
 */
export class Storage {
    /** The one storage instance */
    private static instance?: Storage;

    /** Set of all index files */
    private indexFiles: Record<string, IIndex>;

    /** Listeners to data changes */
    private dataListeners: ((data: IStorageData) => void)[] = [];

    /**
     * Base constructor
     */
    private constructor() {
        fs.mkdirSync(dataStorage, { recursive: true });
        this.indexFiles = {};
    }

    /**
     * Returns storage instance.
     *
     * @returns Storage instance
     */
    public static async getInstance(): Promise<Storage> {
        if (Storage.instance === undefined) {
            const storage = new Storage();
            Storage.instance = storage;
            if (fs.existsSync(indexFile)) {
                const indexFileContent = await fs.readFile(indexFile, 'utf8');
                indexFileContent
                    .split('\n')
                    .filter((content) => content.length > 0)
                    .map((row) => row.split(';'))
                    .forEach((row) => {
                        storage.indexFiles[row[0]] = {filename: row[0], timestamp: parseInt(row[1])};
                    });
            }
        }
        return Storage.instance;
    }

    /**
     * Adds a listener to this storage object.
     *
     * @param listener Listener to add
     * @returns The added listener
     */
    public addListeners(listener: (data: IStorageData) => void): (data: IStorageData) => void {
        this.dataListeners.push(listener);
        return listener;
    }

    /**
     * Removes the given listener from this storage object.
     *
     * @param listener Listener to remove
     */
    public removeListeners(listener: (data: IStorageData) => void): void {
        this.dataListeners = this.dataListeners.filter((listListener) => listListener !== listener);
    }

    /**
     * Store data
     *
     * @param inputLine Raw data to store
     * @param timestamp Timestamp of data
     */
    public async storeDataLine(inputLine: string, timestamp: number): Promise<void> {
        const data = await this.parseData(inputLine, timestamp);
        if (data !== null) {
            await this.writeData(data);
        }
    }

    /**
     * Store some sort of error
     *
     * @param error Type of error
     * @param message Error message to store
     * @param timestamp Timestamp of error
     * @param data Optional data to store
     */
    public async storeError(error: IStorageError['error'], message: string, timestamp: number, data?: string):
        Promise<void> {
        const errorObject: IStorageError = {
            timestamp,
            error,
            message,
            data,
        };
        await this.writeError(errorObject);
        console.warn('Got an error: ' + error, {errorObject});
    }


    /**
     * Pipes data in the given timeframe to the given pipe
     *
     * @param from Start timestamp
     * @param to End timestamp
     * @param pipe Pipe for data
     */
    public async pipeDataCsv(from: number, to: number, pipe: stream.Writable): Promise<void> {
        const files = await fs.readdir(dataStorage);
        for (const file of files) {
            const fileTimestamp = parseInt(file) * timestampDivider;
            if (! isNaN(fileTimestamp) && file.match(/^[0-9]+\.csv$/)) {
                const [start, end] = [fileTimestamp, fileTimestamp + timestampDivider];
                if (end >= from && start <= to) {
                    await this.pipeFile(file, from, to, pipe);
                }
            }
        }
    }

    /**
     * Pipes all entries inside the given timeframe from file to response
     *
     * @param filename File to read from
     * @param from Start date to send data
     * @param to End data to send data
     * @param pipe Response to pipe to
     */
    public async pipeFile(filename: string, from: number, to: number, pipe: stream.Writable): Promise<void> {
        const fileStream = fs.createReadStream(path.join(dataStorage, filename));
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });
        for await (const line of rl) {
            const timestamp = parseInt(line.split(';')[0]);
            if (timestamp >= from && timestamp <= to) {
                pipe.write(line + '\n');
            }
        }
    }

    /**
     * Retzurns the size of the stored data
     *
     * @returns Size of stored data
     */
    public async getDbSize(): Promise<number> {
        let size = 0;
        const files = await fs.readdir(dataStorage);
        for (const file of files) {
            const stat = await fs.stat(path.join(dataStorage, file));
            size += stat.size;
        }
        return size;
    }

    /**
     * Returns a date part for a filename.
     *
     * @param timestamp Timestamp to get file name for
     * @returns Date specific file part
     */
    private getTimestampDivided(timestamp: number): number {
        // Leads to ~5 MB / File.
        return Math.floor(timestamp / timestampDivider);
    }

    /**
     * Emits the given data to all listeners
     *
     * @param data Data to emit
     */
    private emitDataToListeners(data: IStorageData): void {
        for (const listener of this.dataListeners) {
            try {
                listener(data);
            } catch (err) {
                console.warn('Failed to execute listener', {err});
            }
        }
    }

    /**
     * Store data on disk
     *
     * @param data data to store
     */
    private async writeData(data: IStorageData): Promise<void> {
        const filename = path.join(dataStorage, this.getTimestampDivided(data.timestamp) + '.csv');
        await fs.appendFile(filename, [
            data.timestamp,
            data.input[0]?.val ?? null,
            data.input[1]?.val ?? null,
            data.input[2]?.val ?? null,
            data.input[3]?.val ?? null,
            data.output[0]?.val ?? null,
            data.output[1]?.val ?? null,
            data.boot ? 1 : 0,
            data.state,
        ].join(';') + '\n');
        this.emitDataToListeners(data);
    }

    /**
     * Store error on disk
     *
     * @param error error to store
     */
    private async writeError(error: IStorageError): Promise<void> {
        const filename = path.join(dataStorage, this.getTimestampDivided(error.timestamp) + '-error.csv');
        await Promise.all([
            fs.appendFile(filename, [
                error.timestamp,
                error.data ?? null,
                error.error,
                error.message,
            ].join(';') + '\n'),
        ]);
    }

    /**
     * Parses the given input line. Either retrieves a data or error object.
     *
     * @param inputLine Data line from arduino
     * @param timestamp Optional timestamp of data (defaults to now)
     * @returns Object to store
     */
    private async parseData(inputLine: string, timestamp: number): Promise<IStorageData | null> {
        try {
            const inputData = JSON.parse(inputLine) as IStorageData;
            inputData.timestamp = timestamp;
            const valid = TSON.validateEquals<IStorageData>(inputData);
            if (! valid.success) {
                await this.storeError('validate',
                    valid.errors
                        .map((error) => error.path + ' --> Expect: ' + error.expected + '. Got: ' + error.value)
                        .join('\n'), timestamp, inputLine);
                return null;
            }
            return inputData;
        } catch (err) {
            await this.storeError('parse', (err as Error).message, timestamp, inputLine);
            return null;
        }
    }
}
