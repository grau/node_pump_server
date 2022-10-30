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
const indexFile = path.join(dataStorage, 'index.txt');
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
        fs.mkdirSync(dataStorage, { recursive: true });
        this.indexFiles = new Set();
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
                    storage.indexFiles = new Set(indexFileContent
                        .split('\n')
                        .filter((content) => content.length > 0));
                }
            }
            return Storage.instance;
        });
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
     * Checks if the given filename is already part of index and optionally updates index
     *
     * @param filename Filename to add
     */
    updateIndex(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.indexFiles.has(filename)) {
                this.indexFiles.add(filename);
                yield fs.appendFile(indexFile, filename + '\n');
            }
        });
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
            yield Promise.all([
                fs.appendFile(filename, [
                    data.timestamp,
                    (_b = (_a = data.input[0]) === null || _a === void 0 ? void 0 : _a.val) !== null && _b !== void 0 ? _b : null,
                    (_d = (_c = data.input[1]) === null || _c === void 0 ? void 0 : _c.val) !== null && _d !== void 0 ? _d : null,
                    (_f = (_e = data.input[2]) === null || _e === void 0 ? void 0 : _e.val) !== null && _f !== void 0 ? _f : null,
                    (_h = (_g = data.input[3]) === null || _g === void 0 ? void 0 : _g.val) !== null && _h !== void 0 ? _h : null,
                    (_k = (_j = data.output[0]) === null || _j === void 0 ? void 0 : _j.val) !== null && _k !== void 0 ? _k : null,
                    (_m = (_l = data.output[1]) === null || _l === void 0 ? void 0 : _l.val) !== null && _m !== void 0 ? _m : null,
                    data.boot ? 1 : 0,
                    data.state,
                ].join(';') + '\n'),
                this.updateIndex(filename),
            ]);
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
                this.updateIndex(filename),
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
