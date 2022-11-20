var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * @file Dexie database instance
 */
import Dexie from 'dexie';
/**
 * Database interface class.
 */
class Database extends Dexie {
    /**
     * Default constructor
     */
    constructor() {
        super('pump');
        const stores = {
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
    updateFileIndex(files) {
        return __awaiter(this, void 0, void 0, function* () {
            const filenames = files.map((file) => file.filename);
            const knownKeys = yield this.fileIndex.where('filename').anyOf(filenames).keys();
            for (const file of files) {
                if (knownKeys.includes(file.filename)) {
                    this.fileIndex.update(file.filename, { timestamp: file.timestamp })
                        .catch((err) => console.warn('Failed to update file index entry', { file, err }));
                }
                else {
                    this.fileIndex.add({
                        filename: file.filename,
                        fetched: 0,
                        lastChanged: file.timestamp,
                    }).catch((err) => console.warn('Failed to add file index entry', { file, err }));
                }
            }
        });
    }
    /**
     * Sets the given filename to fetched
     *
     * @param filename Filename to update status for
     */
    setFileIndex(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fileIndex.update(filename, { fetched: Date.now() });
        });
    }
    /**
     * Fetches the complete file index
     *
     * @returns complete file index
     */
    getFileIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fileIndex.reverse().sortBy('filename');
        });
    }
    /**
     * Puts all data points in storage
     *
     * @param data Data to add
     */
    addData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.data.bulkPut(data);
        });
    }
    /**
     * Puts all error events in storage
     *
     * @param error Error to add
     */
    addError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.error.bulkPut(error);
        });
    }
    /**
     * Returns all data points in the given timeframe
     *
     * @param from Start timestamp
     * @param to End timestamp
     * @returns Datapoints
     */
    getData(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching data', { from, to });
            return this.data.where('timestamp').between(from, to, true, true).toArray();
        });
    }
    /**
     * Iterates over each line in the storage and calls callback.
     * Promise resolves, once all files are processed.
     *
     * @param from Start timestamp
     * @param to End timestamp
     * @param callback Callback to process rows
     */
    getDataIterator(from, to, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.data.where('timestamp').between(from, to, true, true).each(callback);
        });
    }
    /**
     * Timestamp of first datapoint in database
     *
     * @returns timestamp or undefined if there is no data (yet)
     */
    getMinDataDate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (_a = (yield this.data.orderBy('timestamp').first())) === null || _a === void 0 ? void 0 : _a.timestamp;
        });
    }
}
/** Database instance */
export const db = new Database();
