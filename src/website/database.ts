/**
 * @file Dexie database instance
 */
import Dexie from 'dexie';

import type { IStorageData, IStorageError } from '../interfaces/IData';
import type { IFileIndex } from './databaseFormat';

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
        this.version(1).stores(stores);
    }

    /**
     * Adds all filenames to index. Files not already in index will be set to unfetched.
     * Files in index will be silently discarded
     *
     * @param filenames Filenames to add
     */
    public async updateFileIndex(filenames: string[]): Promise<void> {
        await Promise.allSettled(
            filenames
                .map((filename) => this.fileIndex.add({filename, fetched: 0})));
    }

    /**
     * Sets the given filename to fetched
     *
     * @param filename Filename to update status for
     */
    public async setFileIndex(filename: string): Promise<void> {
        await this.fileIndex.update(filename, {fetched: true});
    }

    /**
     * Fetches the next unfechted file from file index
     *
     * @returns filename to already fetched
     */
    public async getNextFilenames(): Promise<string[]> {
        return (await this.fileIndex.where('fetched').equals(0).reverse().sortBy('filename'))
            .map((fileIndex) => fileIndex.filename);
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
     * @param error Errors to add
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
        return this.data.where('timestamp').between(from, to, true, true).toArray();
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
