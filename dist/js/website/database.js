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
        this.version(1).stores(stores);
    }
    /**
     * Adds all filenames to index. Files not already in index will be set to unfetched.
     * Files in index will be silently discarded
     *
     * @param filenames Filenames to add
     */
    updateFileIndex(filenames) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.allSettled(filenames
                .map((filename) => this.fileIndex.add({ filename, fetched: 0 })));
        });
    }
    /**
     * Sets the given filename to fetched
     *
     * @param filename Filename to update status for
     */
    setFileIndex(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fileIndex.update(filename, { fetched: true });
        });
    }
    /**
     * Fetches the next unfechted file from file index
     *
     * @returns filename to already fetched
     */
    getNextFilenames() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.fileIndex.where('fetched').equals(0).reverse().sortBy('filename'))
                .map((fileIndex) => fileIndex.filename);
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
     * @param error Errors to add
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
            return this.data.where('timestamp').between(from, to, true, true).toArray();
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
