/**
 * @file Stores data
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
import path from 'path';
import fs from 'fs-extra';
import TSON from 'typescript-json';
import BetterSqlite3 from 'better-sqlite3';
import { dataStorage } from '../config.js';
/** Amount of data held in local storage (6 hrs) */
const pufferLength = 1800 * 6;
/** Storage location of database */
export const dbLocation = path.join(dataStorage, 'database.db');
/**
 * Central storage class for writing/reading data
 *
 * @todo Add ringbuffer logic for data and error
 */
export class Storage {
    /**
     * Base constructor
     */
    constructor() {
        this.data = [];
        this.error = [];
        fs.mkdirSync(dataStorage, { recursive: true });
        this.db = new BetterSqlite3(dbLocation);
        // @see https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/performance.md
        this.db.pragma('journal_mode = WAL');
        this.db.exec('CREATE TABLE IF NOT EXISTS data '
            + '(timestamp INT PRIMARY KEY, input0 int, input1 int, input2 int, input3 int, '
            + 'output0 INT, output1 INT, boot int, state int);');
        this.db.exec('CREATE TABLE IF NOT EXISTS error '
            + '(timestamp INT PRIMARY KEY, date TEXT, error TEXT, message TEXT);');
        this.stmtInsertData = this.db.prepare('INSERT INTO data '
            + '(timestamp, input0, input1, input2, input3, output0, output1, boot, state) '
            + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        this.stmtInsertError = this.db.prepare('INSERT INTO error '
            + '(timestamp, date, error, message) '
            + 'VALUES (?, ?, ?, ?)');
    }
    /**
     * Returns storage instance.
     *
     * @returns Storage instance
     */
    static getInstance() {
        if (Storage.instance === undefined) {
            const storage = new Storage();
            Storage.instance = storage;
        }
        return Storage.instance;
    }
    /**
     * Store data
     *
     * @param inputLine Raw data to store
     * @param timestamp Timestamp of data
     */
    storeDataLine(inputLine, timestamp) {
        const data = this.parseData(inputLine, timestamp);
        if (data !== null) {
            this.writeData(data);
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
    storeError(error, message, timestamp, data) {
        const errorObject = {
            timestamp,
            error,
            message,
            data,
        };
        this.writeError(errorObject);
        console.warn('Got an error: ' + error, { errorObject });
    }
    /**
     * Fetches data from database and returns it
     * Yes - you can dump the whole database with this function! So use caution
     *
     * @param from Starting timestamp
     * @param to Ending timetstamp
     * @returns Storage data
     */
    getData(from, to) {
        return this.getRawData(from, to).map(this.getStorageDataFromDbData);
    }
    /**
     * Fetches data from database and returns it
     * Yes - you can dump the whole database with this function! So use caution
     *
     * @param from Starting timestamp
     * @param to Ending timetstamp
     * @returns Storage data
     */
    getRawData(from, to) {
        const stmt = this.db.prepare('SELECT timestamp, input0, input1, input2, input3, output0, output1, boot, state '
            + 'FROM data '
            + 'WHERE timestamp >= ? AND timestamp <= ? '
            + 'ORDER BY timestamp;');
        return stmt.all([from !== null && from !== void 0 ? from : 0, to !== null && to !== void 0 ? to : Date.now() * 32]);
    }
    /**
     * Returns the requested data as an iterator object
     *
     * @param from Starting timestamp
     * @param to Ending timetstamp
     * @returns Iterator of the storage data
     */
    getDataIterator(from, to) {
        const stmt = this.db.prepare('SELECT timestamp, input0, input1, input2, input3, output0, output1, boot, state '
            + 'FROM data '
            + 'WHERE timestamp >= ? AND timestamp <= ? '
            + 'ORDER BY timestamp;');
        return stmt.iterate([from, to]);
    }
    /**
     * Returns the smallest timestamp in database
     *
     * @returns Smalest data timestamp in database
     */
    getMinDate() {
        return this.db.prepare('SELECT min(timestamp) AS m FROM data;').get().m;
    }
    /**
     * Writes backup file to disk. Returns backup filenames.
     *
     * @returns filename of backup file.
     */
    getBackupFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = path.resolve(path.join(dataStorage, Date.now() + '-database.db'));
            yield this.db.backup(filename);
            return filename;
        });
    }
    /**
     * Transforms from database format to storage format
     *
     * @param data Data from database
     * @returns Data in storage format
     */
    getStorageDataFromDbData(data) {
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
    writeData(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        this.data.push(data);
        if (this.data.length > pufferLength) {
            this.data.shift();
        }
        this.stmtInsertData.run([
            data.timestamp,
            (_b = (_a = data.input[0]) === null || _a === void 0 ? void 0 : _a.val) !== null && _b !== void 0 ? _b : null,
            (_d = (_c = data.input[1]) === null || _c === void 0 ? void 0 : _c.val) !== null && _d !== void 0 ? _d : null,
            (_f = (_e = data.input[2]) === null || _e === void 0 ? void 0 : _e.val) !== null && _f !== void 0 ? _f : null,
            (_h = (_g = data.input[3]) === null || _g === void 0 ? void 0 : _g.val) !== null && _h !== void 0 ? _h : null,
            (_k = (_j = data.output[0]) === null || _j === void 0 ? void 0 : _j.val) !== null && _k !== void 0 ? _k : null,
            (_m = (_l = data.output[1]) === null || _l === void 0 ? void 0 : _l.val) !== null && _m !== void 0 ? _m : null,
            data.boot ? 1 : 0,
            data.state,
        ]);
    }
    /**
     * Store error on disk
     *
     * @param error error to store
     */
    writeError(error) {
        var _a;
        this.error.push(error);
        this.stmtInsertError.run([
            error.timestamp,
            (_a = error.data) !== null && _a !== void 0 ? _a : null,
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
    parseData(inputLine, timestamp) {
        try {
            const inputData = JSON.parse(inputLine);
            inputData.timestamp = timestamp;
            const valid = (input => { const $out = {
                success: true,
                errors: []
            }; const $pred = TSON.validateEquals.predicate($out); ((input, path = "$input") => {
                const $join = TSON.validateEquals.join;
                const $vo = [
                    (input, path, exceptionable) => [$pred("number" === typeof input.timestamp, exceptionable, () => ({
                            path: path + ".timestamp",
                            expected: "number",
                            value: input.timestamp
                        })), $pred(0 === input.state || 1 === input.state || 2 === input.state || 3 === input.state || 4 === input.state, exceptionable, () => ({
                            path: path + ".state",
                            expected: "(0 | 1 | 2 | 3 | 4)",
                            value: input.state
                        })), $pred("boolean" === typeof input.boot, exceptionable, () => ({
                            path: path + ".boot",
                            expected: "boolean",
                            value: input.boot
                        })), $pred(Array.isArray(input.input) && input.input.map((elem, index1) => $pred(null !== elem && $pred("object" === typeof elem && null !== elem && $vo[1](elem, path + ".input[" + index1 + "]", true && exceptionable), exceptionable, () => ({
                            path: path + ".input[" + index1 + "]",
                            expected: "Resolve<__type>",
                            value: elem
                        })), exceptionable, () => ({
                            path: path + ".input[" + index1 + "]",
                            expected: "Resolve<__type>",
                            value: elem
                        }))).every(flag => true === flag), exceptionable, () => ({
                            path: path + ".input",
                            expected: "Array<Resolve<__type>>",
                            value: input.input
                        })), $pred(Array.isArray(input.output) && input.output.map((elem, index2) => $pred(null !== elem && $pred("object" === typeof elem && null !== elem && $vo[2](elem, path + ".output[" + index2 + "]", true && exceptionable), exceptionable, () => ({
                            path: path + ".output[" + index2 + "]",
                            expected: "Resolve<__type.o1>",
                            value: elem
                        })), exceptionable, () => ({
                            path: path + ".output[" + index2 + "]",
                            expected: "Resolve<__type.o1>",
                            value: elem
                        }))).every(flag => true === flag), exceptionable, () => ({
                            path: path + ".output",
                            expected: "Array<Resolve<__type.o1>>",
                            value: input.output
                        })), false === exceptionable || Object.entries(input).map(([key, value]) => $pred((() => {
                            if (undefined === value)
                                return true;
                            if (["timestamp", "state", "boot", "input", "output"].some(prop => key === prop))
                                return true;
                            return false;
                        })(), exceptionable, () => ({
                            path: path + $join(key),
                            expected: "undefined",
                            value: value
                        }))).every(flag => true === flag)].every(flag => true === flag),
                    (input, path, exceptionable) => [$pred("number" === typeof input.id, exceptionable, () => ({
                            path: path + ".id",
                            expected: "number",
                            value: input.id
                        })), $pred("number" === typeof input.val, exceptionable, () => ({
                            path: path + ".val",
                            expected: "number",
                            value: input.val
                        })), false === exceptionable || Object.entries(input).map(([key, value]) => $pred((() => {
                            if (undefined === value)
                                return true;
                            if (["id", "val"].some(prop => key === prop))
                                return true;
                            return false;
                        })(), exceptionable, () => ({
                            path: path + $join(key),
                            expected: "undefined",
                            value: value
                        }))).every(flag => true === flag)].every(flag => true === flag),
                    (input, path, exceptionable) => [$pred("number" === typeof input.id, exceptionable, () => ({
                            path: path + ".id",
                            expected: "number",
                            value: input.id
                        })), $pred("number" === typeof input.val, exceptionable, () => ({
                            path: path + ".val",
                            expected: "number",
                            value: input.val
                        })), false === exceptionable || Object.entries(input).map(([key, value]) => $pred((() => {
                            if (undefined === value)
                                return true;
                            if (["id", "val"].some(prop => key === prop))
                                return true;
                            return false;
                        })(), exceptionable, () => ({
                            path: path + $join(key),
                            expected: "undefined",
                            value: value
                        }))).every(flag => true === flag)].every(flag => true === flag)
                ];
                return $pred(null !== input && $pred("object" === typeof input && null !== input && $vo[0](input, path + "", true), true, () => ({
                    path: path + "",
                    expected: "Resolve<IStorageData>",
                    value: input
                })), true, () => ({
                    path: path + "",
                    expected: "Resolve<IStorageData>",
                    value: input
                }));
            })(input); return $out; })(inputData);
            if (!valid.success) {
                this.storeError('validate', valid.errors
                    .map((error) => error.path + ' --> Expect: ' + error.expected + '. Got: ' + error.value)
                    .join('\n'), timestamp, inputLine);
                return null;
            }
            return inputData;
        }
        catch (err) {
            this.storeError('parse', err.message, timestamp, inputLine);
            return null;
        }
    }
}
