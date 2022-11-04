/**
 * @file Stores data. THis is a pure CSV-File based version
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
import dateFormat from 'dateformat';
import { dataStorage } from '../config.js';
/** Name of index file containing a list of all files */
const indexFile = path.join(dataStorage, 'index.csv');
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
        /** Listeners to data changes */
        this.dataListeners = [];
        fs.mkdirSync(dataStorage, { recursive: true });
        this.indexFiles = {};
    }
    /**
     * Returns storage instance.
     *
     * @returns Storage instance
     */
    static getInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Storage.instance === undefined) {
                const storage = new Storage();
                Storage.instance = storage;
                if (fs.existsSync(indexFile)) {
                    const indexFileContent = yield fs.readFile(indexFile, 'utf8');
                    indexFileContent
                        .split('\n')
                        .filter((content) => content.length > 0)
                        .map((row) => row.split(';'))
                        .forEach((row) => {
                        storage.indexFiles[row[0]] = { filename: row[0], timestamp: parseInt(row[1]) };
                    });
                }
            }
            return Storage.instance;
        });
    }
    /**
     * Adds a listener to this storage object.
     *
     * @param listener Listener to add
     * @returns The added listener
     */
    addListeners(listener) {
        this.dataListeners.push(listener);
        return listener;
    }
    /**
     * Removes the given listener from this storage object.
     *
     * @param listener Listener to remove
     */
    removeListeners(listener) {
        this.dataListeners = this.dataListeners.filter((listListener) => listListener !== listener);
    }
    /**
     * Store data
     *
     * @param inputLine Raw data to store
     * @param timestamp Timestamp of data
     */
    storeDataLine(inputLine, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.parseData(inputLine, timestamp);
            if (data !== null) {
                yield this.writeData(data);
            }
        });
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
        return __awaiter(this, void 0, void 0, function* () {
            const errorObject = {
                timestamp,
                error,
                message,
                data,
            };
            yield this.writeError(errorObject);
            console.warn('Got an error: ' + error, { errorObject });
        });
    }
    /**
     * Returns a date part for a filename.
     *
     * @param timestamp Timestamp to get file name for
     * @returns Date specific file part
     */
    getDateFile(timestamp) {
        return dateFormat(new Date(timestamp), 'yyyy_WW');
    }
    /**
     * Emits the given data to all listeners
     *
     * @param data Data to emit
     */
    emitDataToListeners(data) {
        for (const listener of this.dataListeners) {
            try {
                listener(data);
            }
            catch (err) {
                console.warn('Failed to execute listener', { err });
            }
        }
    }
    /**
     * Store data on disk
     *
     * @param data data to store
     */
    writeData(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __awaiter(this, void 0, void 0, function* () {
            const filename = path.join(dataStorage, this.getDateFile(data.timestamp) + '.csv');
            yield fs.appendFile(filename, [
                data.timestamp,
                (_b = (_a = data.input[0]) === null || _a === void 0 ? void 0 : _a.val) !== null && _b !== void 0 ? _b : null,
                (_d = (_c = data.input[1]) === null || _c === void 0 ? void 0 : _c.val) !== null && _d !== void 0 ? _d : null,
                (_f = (_e = data.input[2]) === null || _e === void 0 ? void 0 : _e.val) !== null && _f !== void 0 ? _f : null,
                (_h = (_g = data.input[3]) === null || _g === void 0 ? void 0 : _g.val) !== null && _h !== void 0 ? _h : null,
                (_k = (_j = data.output[0]) === null || _j === void 0 ? void 0 : _j.val) !== null && _k !== void 0 ? _k : null,
                (_m = (_l = data.output[1]) === null || _l === void 0 ? void 0 : _l.val) !== null && _m !== void 0 ? _m : null,
                data.boot ? 1 : 0,
                data.state,
            ].join(';') + '\n');
            this.emitDataToListeners(data);
        });
    }
    /**
     * Store error on disk
     *
     * @param error error to store
     */
    writeError(error) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const filename = path.join(dataStorage, this.getDateFile(error.timestamp) + '-error.csv');
            yield Promise.all([
                fs.appendFile(filename, [
                    error.timestamp,
                    (_a = error.data) !== null && _a !== void 0 ? _a : null,
                    error.error,
                    error.message,
                ].join(';') + '\n'),
            ]);
        });
    }
    /**
     * Parses the given input line. Either retrieves a data or error object.
     *
     * @param inputLine Data line from arduino
     * @param timestamp Optional timestamp of data (defaults to now)
     * @returns Object to store
     */
    parseData(inputLine, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const inputData = JSON.parse(inputLine);
                inputData.timestamp = timestamp;
                const valid = (input => {
                    const $out = {
                        success: true,
                        errors: []
                    };
                    const $report = TSON.validateEquals.report($out);
                    const $join = TSON.validateEquals.join;
                    ((input, path, exceptionable) => {
                        const $vo0 = (input, path, exceptionable) => ["number" === typeof input.timestamp || $report(exceptionable, {
                                path: path + ".timestamp",
                                expected: "number",
                                value: input.timestamp
                            }), 0 === input.state || 1 === input.state || 2 === input.state || 3 === input.state || 4 === input.state || $report(exceptionable, {
                                path: path + ".state",
                                expected: "(0 | 1 | 2 | 3 | 4)",
                                value: input.state
                            }), "boolean" === typeof input.boot || $report(exceptionable, {
                                path: path + ".boot",
                                expected: "boolean",
                                value: input.boot
                            }), (Array.isArray(input.input) || $report(exceptionable, {
                                path: path + ".input",
                                expected: "Array<Resolve<__type>>",
                                value: input.input
                            })) && input.input.map((elem, index1) => ("object" === typeof elem && null !== elem || $report(exceptionable, {
                                path: path + ".input[" + index1 + "]",
                                expected: "Resolve<__type>",
                                value: elem
                            })) && $vo1(elem, path + ".input[" + index1 + "]", true && exceptionable) || $report(exceptionable, {
                                path: path + ".input[" + index1 + "]",
                                expected: "Resolve<__type>",
                                value: elem
                            })).every(flag => true === flag) || $report(exceptionable, {
                                path: path + ".input",
                                expected: "Array<Resolve<__type>>",
                                value: input.input
                            }), (Array.isArray(input.output) || $report(exceptionable, {
                                path: path + ".output",
                                expected: "Array<Resolve<__type.o1>>",
                                value: input.output
                            })) && input.output.map((elem, index2) => ("object" === typeof elem && null !== elem || $report(exceptionable, {
                                path: path + ".output[" + index2 + "]",
                                expected: "Resolve<__type.o1>",
                                value: elem
                            })) && $vo2(elem, path + ".output[" + index2 + "]", true && exceptionable) || $report(exceptionable, {
                                path: path + ".output[" + index2 + "]",
                                expected: "Resolve<__type.o1>",
                                value: elem
                            })).every(flag => true === flag) || $report(exceptionable, {
                                path: path + ".output",
                                expected: "Array<Resolve<__type.o1>>",
                                value: input.output
                            }), false === exceptionable || Object.entries(input).map(([key, value]) => {
                                if (undefined === value)
                                    return true;
                                if (["timestamp", "state", "boot", "input", "output"].some(prop => key === prop))
                                    return true;
                                return $report(exceptionable, {
                                    path: path + $join(key),
                                    expected: "undefined",
                                    value: value
                                });
                            }).every(flag => true === flag)].every(flag => true === flag);
                        const $vo1 = (input, path, exceptionable) => ["number" === typeof input.id || $report(exceptionable, {
                                path: path + ".id",
                                expected: "number",
                                value: input.id
                            }), "number" === typeof input.val || $report(exceptionable, {
                                path: path + ".val",
                                expected: "number",
                                value: input.val
                            }), false === exceptionable || Object.entries(input).map(([key, value]) => {
                                if (undefined === value)
                                    return true;
                                if (["id", "val"].some(prop => key === prop))
                                    return true;
                                return $report(exceptionable, {
                                    path: path + $join(key),
                                    expected: "undefined",
                                    value: value
                                });
                            }).every(flag => true === flag)].every(flag => true === flag);
                        const $vo2 = (input, path, exceptionable) => ["number" === typeof input.id || $report(exceptionable, {
                                path: path + ".id",
                                expected: "number",
                                value: input.id
                            }), "number" === typeof input.val || $report(exceptionable, {
                                path: path + ".val",
                                expected: "number",
                                value: input.val
                            }), false === exceptionable || Object.entries(input).map(([key, value]) => {
                                if (undefined === value)
                                    return true;
                                if (["id", "val"].some(prop => key === prop))
                                    return true;
                                return $report(exceptionable, {
                                    path: path + $join(key),
                                    expected: "undefined",
                                    value: value
                                });
                            }).every(flag => true === flag)].every(flag => true === flag);
                        return ("object" === typeof input && null !== input || $report(true, {
                            path: path + "",
                            expected: "Resolve<IStorageData>",
                            value: input
                        })) && $vo0(input, path + "", true) || $report(true, {
                            path: path + "",
                            expected: "Resolve<IStorageData>",
                            value: input
                        });
                    })(input, "$input", true);
                    if (0 !== $out.errors.length)
                        $out.success = false;
                    return $out;
                })(inputData);
                if (!valid.success) {
                    yield this.storeError('validate', valid.errors
                        .map((error) => error.path + ' --> Expect: ' + error.expected + '. Got: ' + error.value)
                        .join('\n'), timestamp, inputLine);
                    return null;
                }
                return inputData;
            }
            catch (err) {
                yield this.storeError('parse', err.message, timestamp, inputLine);
                return null;
            }
        });
    }
}
