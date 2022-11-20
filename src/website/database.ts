/**
 * @file Dexie database instance
 */
import Dexie from 'dexie';

import type { IStorageData, IStorageError } from '../interfaces/IData';
import type { IFileIndex } from './databaseFormat';
import type { IIndex } from '../fetchAndStore/storage-csv';

/**
 * Database interface class.
 */
class Database extends Dexie {
    /** File index */
    private fileIndex!: Dexie.Table<IFileIndex, string>;

    /** Datapoints*/
    private data!: Dexie.Table<IStorageData, string>;

    /** Error events */
    private error!: Dexie.Table<IStorageError, string>;

    /**
     * Default constructor
     */
    public constructor() {
        super('pump');
        const stores: Record<string, string> = {
            fileIndex: 'filename, fetched',
            data: 'timestamp',
            error: 'timestamp',
        };
        this.version(2).stores(stores);
    }

    /**
     * Adds all filenames to index. Files not already in index will be set to unfetched.
     * Files in index will be silently discarded
     *
     * @param files Fils to add
     */
    public async updateFileIndex(files: IIndex[]): Promise<void> {
        const filenames = files.map((file) => file.filename);
        const knownKeys = await this.fileIndex.where('filename').anyOf(filenames).keys() as string[];
        for (const file of files) {
            if (knownKeys.includes(file.filename)) {
                this.fileIndex.update(file.filename, {timestamp: file.timestamp})
                    .catch((err) => console.warn('Failed to update file index entry', {file, err}));
            } else {
                this.fileIndex.add({
                    filename: file.filename,
                    fetched: 0,
                    lastChanged: file.timestamp,
                }).catch((err) => console.warn('Failed to add file index entry', {file, err}));
            }
        }
    }

    /**
     * Sets the given filename to fetched
     *
     * @param filename Filename to update status for
     */
    public async setFileIndex(filename: string): Promise<void> {
        await this.fileIndex.update(filename, {fetched: Date.now()});
    }

    /**
     * Fetches the complete file index
     *
     * @returns complete file index
     */
    public async getFileIndex(): Promise<IFileIndex[]> {
        return this.fileIndex.reverse().sortBy('filename');
    }

    /**
     * Puts all data points in storage
     *
     * @param data Data to add
     */
    public async addData(data: IStorageData[]): Promise<void> {
        await this.data.bulkPut(data);
    }

    /**
     * Puts all error events in storage
     *
     * @param error Error to add
     */
    public async addError(error: IStorageError[]): Promise<void> {
        await this.error.bulkPut(error);
    }

    /**
     * Returns all data points in the given timeframe
     *
     * @param from Start timestamp
     * @param to End timestamp
     * @returns Datapoints
     */
    public async getData(from: number, to: number): Promise<IStorageData[]> {
        console.log('Fetching data', {from, to});
        return this.data.where('timestamp').between(from, to, true, true).toArray();
    }

    /**
     * Iterates over each line in the storage and calls callback.
     * Promise resolves, once all files are processed.
     *
     * @param from Start timestamp
     * @param to End timestamp
     * @param callback Callback to process rows
     */
    public async getDataIterator(from: number, to: number, callback: (row: IStorageData) => void): Promise<void> {
        await this.data.where('timestamp').between(from, to, true, true).each(callback);
    }

    /**
     * Timestamp of first datapoint in database
     *
     * @returns timestamp or undefined if there is no data (yet)
     */
    public async getMinDataDate(): Promise<number | undefined> {
        return (await this.data.orderBy('timestamp').first())?.timestamp;
    }
}

/** Database instance */
export const db = new Database();
