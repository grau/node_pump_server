/**
 * @file Stores data
 */

import path from 'path';
import fs from 'fs-extra';
import TSON from 'typescript-json';
import mysql from 'mysql2/promise';

import { dataStorage } from '../config.js';
import type { IStorageData, IStorageError } from '../interfaces/IData.js';

/** Amount of data held in local storage (6 hrs) */
const pufferLength = 1800 * 6;

/** Data how it is stored in db */
interface IDbData {
    timestamp: number;
    input0: number;
    input1: number;
    input2: number;
    input3: number;
    output0: number;
    output1: number;
    boot: number;
    state: number;
}

/** Storage location of database */
export const dbLocation = path.join(dataStorage, 'database.db');

/**
 * Central storage class for writing/reading data
 *
 * @todo Add ringbuffer logic for data and error
 */
export class Storage {
    /** The one storage instance */
    private static instance?: Storage;

    /** All data objects */
    public data: IStorageData[];

    /** All error objects */
    public error: IStorageError[];

    /** SQLite database instance */
    public db: mysql.Pool;

    /**
     * Base constructor
     */
    private constructor() {
        this.data = [];
        this.error = [];
        fs.mkdirSync(dataStorage, { recursive: true });

        this.db = mysql.createPool({
            host: 'localhost',
            user: 'root',
            database: 'pump',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
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
            await Storage.instance.db.execute('CREATE TABLE IF NOT EXISTS data '
                + '(timestamp INT PRIMARY KEY, input0 int, input1 int, input2 int, input3 int, '
                + 'output0 INT, output1 INT, boot int, state int);');
            await Storage.instance.db.execute('CREATE TABLE IF NOT EXISTS error '
            + '(timestamp INT PRIMARY KEY, date TEXT, error TEXT, message TEXT);');
        }
        return Storage.instance;
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
     * Fetches data from database and returns it
     * Yes - you can dump the whole database with this function! So use caution
     *
     * @param from Starting timestamp
     * @param to Ending timetstamp
     * @returns Storage data
     */
    public async getData(from: number | null, to: number | null): Promise<IStorageData[]> {
        return (await this.getRawData(from, to)).map(this.getStorageDataFromDbData);
    }

    /**
     * Fetches data from database and returns it
     * Yes - you can dump the whole database with this function! So use caution
     *
     * @param from Starting timestamp
     * @param to Ending timetstamp
     * @returns Storage data
     */
    public async getRawData(from: number | null, to: number | null): Promise<IDbData[]> {
        const result = await this.db.query('SELECT '
            + 'timestamp, input0, input1, input2, input3, output0, output1, boot, state '
            + 'FROM data '
            + 'WHERE timestamp >= ? AND timestamp <= ? '
            + 'ORDER BY timestamp;', [from ?? 0, to ?? Date.now() * 32]);
        return result[0] as IDbData[];
    }

    /**
     * Returns the requested data as an iterator object
     *
     * @param from Starting timestamp
     * @param to Ending timetstamp
     * @returns Iterator of the storage data
     */
    public async getDataIterator(from: number, to: number): Promise<IterableIterator<IDbData>> {
        const result = await this.db.query('SELECT '
            + 'timestamp, input0, input1, input2, input3, output0, output1, boot, state '
            + 'FROM data '
            + 'WHERE timestamp >= ? AND timestamp <= ? '
            + 'ORDER BY timestamp;', [from, to]);
        return (result[0] as IDbData[]).values();
    }

    /**
     * Returns the smallest timestamp in database
     *
     * @returns Smalest data timestamp in database
     */
    public async getMinDate(): Promise<number> {
        const result = await this.db.query('SELECT min(timestamp) AS m FROM data;');
        return (result[0] as {m: number}[])[0].m;
    }

    /**
     * Writes backup file to disk. Returns backup filenames.
     *
     * @returns filename of backup file.
     */
    public async getBackupFile(): Promise<string> {
        throw new Error('Not yet implemented');
    }

    /**
     * Transforms from database format to storage format
     *
     * @param data Data from database
     * @returns Data in storage format
     */
    private getStorageDataFromDbData(data: IDbData): IStorageData {
        return {
            timestamp: data.timestamp,
            boot: data.boot === 1,
            state: data.state,
            input: [
                {
                    id: 0,
                    val: data.input0,
                },
                {
                    id: 1,
                    val: data.input1,
                },
                {
                    id: 2,
                    val: data.input2,
                },
                {
                    id: 3,
                    val: data.input3,
                },
            ],
            output: [
                {
                    id: 0,
                    val: data.output0,
                },
                {
                    id: 1,
                    val: data.output1,
                },
            ],
        };
    }

    /**
     * Store data on disk
     *
     * @param data data to store
     */
    private async writeData(data: IStorageData): Promise<void> {
        this.data.push(data);
        if (this.data.length > pufferLength) {
            this.data.shift();
        }
        await this.db.execute('INSERT INTO data '
            + '(timestamp, input0, input1, input2, input3, output0, output1, boot, state) '
            + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            data.timestamp,
            data.input[0]?.val ?? null,
            data.input[1]?.val ?? null,
            data.input[2]?.val ?? null,
            data.input[3]?.val ?? null,
            data.output[0]?.val ?? null,
            data.output[1]?.val ?? null,
            data.boot ? 1 : 0,
            data.state,
        ]);
    }

    /**
     * Store error on disk
     *
     * @param error error to store
     */
    private async writeError(error: IStorageError): Promise<void> {
        this.error.push(error);
        await this.db.execute('INSERT INTO error '
            + '(timestamp, date, error, message) '
            + 'VALUES (?, ?, ?, ?)', [
            error.timestamp,
            error.data ?? null,
            error.error,
            error.message,
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
