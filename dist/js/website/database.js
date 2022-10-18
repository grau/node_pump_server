/**
 * @file Indexeddb / Dexie database
 */
import Dexie from 'dexie';
/** Dexie database */
class Database extends Dexie {
    /** Data points */
    data;
    /** Errors stored at server */
    error;
    /** Index of all files fetched */
    index;
    constructor() {
        super('dashboard');
        this.version(2).stores({
            data: 'timestamp',
            error: 'timestamp',
            index: 'filename, fetched',
        });
    }
    /**
     * Stores the given elements. Does not touch elements already in store
     *
     * @param dataElements Elements to store.
     */
    async storeData(dataElements) {
        await Promise.allSettled(dataElements.map((data) => this.data.add(data, data.timestamp)));
    }
    /**
     * Stores the given elements. Does not touch elements already in store
     *
     * @param errorElements Elements to store.
     */
    async storeError(errorElements) {
        await Promise.allSettled(errorElements.map((error) => this.error.add(error, error.timestamp)));
    }
    /**
     * Adds the given filenames to database as unfetched files.
     * Existing filenames are ignored.
     * Deletes all entries that are NOT in database!
     *
     * @param files Files to store
     */
    async storeIndex(files) {
        const indexEntities = files.map((filename) => ({ filename, fetched: false }));
        await Promise.allSettled(indexEntities.map((index) => this.index.add(index, index.filename)));
        await this.index.where('filename').noneOf(files).delete();
    }
    /**
     * Returns the timestamp with the highest value in database
     *
     * @returns Last timestamp in database
     */
    async getLastDataTimestamp() {
        const lastElem = await this.data.orderBy('timestamp').last();
        return lastElem === undefined ? 0 : lastElem.timestamp;
    }
    /**
     * Returns the timestamp with the highest value in database
     *
     * @returns Last timestamp in database
     */
    async getLastErrorTimestamp() {
        const lastElem = await this.error.orderBy('timestamp').last();
        return lastElem === undefined ? 0 : lastElem.timestamp;
    }
}
/**
 * Dexie database instance
 * Name change is not required, because databases are site-locked.
 * It is more for cosmetic reasons.
 */
export const db = new Database();
