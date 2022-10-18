/**
 * @file Stores data
 */
import path from 'path';
import dateFormat from 'dateformat';
import fs from 'fs-extra';
import { activeStorage } from './config.js';
import TSON from 'typescript-json';
/** Name of index file. Static for all eternity */
const fileNameIndex = path.join(activeStorage, 'index.json');
/** Name of index file. Static for all eternity */
const fileNameData = path.join(activeStorage, 'resume.dat');
/** Name of index file. Static for all eternity */
const fileNameError = path.join(activeStorage, 'resume-error.dat');
export class Storage {
    /** The one storage instance */
    static instance;
    /** All data objects */
    data;
    /** All error objects */
    error;
    /** Year/month/day of today */
    baseDate;
    /** The file index */
    index;
    /**
     * Base constructor
     */
    constructor() {
        this.data = [];
        this.error = [];
        this.index = new Set();
        fs.mkdirSync(activeStorage, { recursive: true });
    }
    /**
     * Returns storage instance.
     */
    static async getInstance() {
        if (Storage.instance === undefined) {
            const storage = new Storage();
            Storage.instance = storage;
            if (fs.existsSync(fileNameIndex)) {
                console.time('Resume index');
                const storageData = await fs.readJSON(fileNameIndex);
                (input => { ((input, path = "$input") => {
                    const $predicate = TSON.assertEquals.predicate;
                    return $predicate(Array.isArray(input) && input.every((elem, index1) => $predicate("string" === typeof elem, true, () => ({
                        path: path + "[" + index1 + "]",
                        expected: "string",
                        value: elem
                    }))), true, () => ({
                        path: path + "",
                        expected: "Array<string>",
                        value: input
                    }));
                })(input); return input; })(storageData);
                storage.index = new Set(storageData);
                console.timeEnd('Resume index');
            }
            if (fs.existsSync(fileNameData)) {
                console.time('Resume data');
                const data = (await fs.readFile(fileNameData, 'utf8'))
                    .split('\n')
                    .filter((line) => line.length > 0)
                    .map((line) => JSON.parse(line));
                (input => { ((input, path = "$input") => {
                    const $predicate = TSON.assertEquals.predicate;
                    const $join = TSON.assertEquals.join;
                    const $ao = [
                        (input, path, exceptionable) => $predicate("number" === typeof input.timestamp, exceptionable, () => ({
                            path: path + ".timestamp",
                            expected: "number",
                            value: input.timestamp
                        })) && $predicate(0 === input.state || 1 === input.state || 2 === input.state || 3 === input.state || 4 === input.state, exceptionable, () => ({
                            path: path + ".state",
                            expected: "(0 | 1 | 2 | 3 | 4)",
                            value: input.state
                        })) && $predicate("boolean" === typeof input.boot, exceptionable, () => ({
                            path: path + ".boot",
                            expected: "boolean",
                            value: input.boot
                        })) && $predicate(Array.isArray(input.input) && input.input.every((elem, index2) => $predicate(null !== elem && $predicate("object" === typeof elem && null !== elem && $ao[1](elem, path + ".input[" + index2 + "]", true && exceptionable), exceptionable, () => ({
                            path: path + ".input[" + index2 + "]",
                            expected: "Resolve<__type>",
                            value: elem
                        })), exceptionable, () => ({
                            path: path + ".input[" + index2 + "]",
                            expected: "Resolve<__type>",
                            value: elem
                        }))), exceptionable, () => ({
                            path: path + ".input",
                            expected: "Array<Resolve<__type>>",
                            value: input.input
                        })) && $predicate(Array.isArray(input.output) && input.output.every((elem, index3) => $predicate(null !== elem && $predicate("object" === typeof elem && null !== elem && $ao[2](elem, path + ".output[" + index3 + "]", true && exceptionable), exceptionable, () => ({
                            path: path + ".output[" + index3 + "]",
                            expected: "Resolve<__type.o1>",
                            value: elem
                        })), exceptionable, () => ({
                            path: path + ".output[" + index3 + "]",
                            expected: "Resolve<__type.o1>",
                            value: elem
                        }))), exceptionable, () => ({
                            path: path + ".output",
                            expected: "Array<Resolve<__type.o1>>",
                            value: input.output
                        })) && (false === exceptionable || Object.entries(input).every(([key, value]) => $predicate((() => {
                            if (undefined === value)
                                return true;
                            if (["timestamp", "state", "boot", "input", "output"].some(prop => key === prop))
                                return true;
                            return false;
                        })(), exceptionable, () => ({
                            path: path + $join(key),
                            expected: "undefined",
                            value: value
                        })))),
                        (input, path, exceptionable) => $predicate("number" === typeof input.id, exceptionable, () => ({
                            path: path + ".id",
                            expected: "number",
                            value: input.id
                        })) && $predicate("number" === typeof input.val, exceptionable, () => ({
                            path: path + ".val",
                            expected: "number",
                            value: input.val
                        })) && (false === exceptionable || Object.entries(input).every(([key, value]) => $predicate((() => {
                            if (undefined === value)
                                return true;
                            if (["id", "val"].some(prop => key === prop))
                                return true;
                            return false;
                        })(), exceptionable, () => ({
                            path: path + $join(key),
                            expected: "undefined",
                            value: value
                        })))),
                        (input, path, exceptionable) => $predicate("number" === typeof input.id, exceptionable, () => ({
                            path: path + ".id",
                            expected: "number",
                            value: input.id
                        })) && $predicate("number" === typeof input.val, exceptionable, () => ({
                            path: path + ".val",
                            expected: "number",
                            value: input.val
                        })) && (false === exceptionable || Object.entries(input).every(([key, value]) => $predicate((() => {
                            if (undefined === value)
                                return true;
                            if (["id", "val"].some(prop => key === prop))
                                return true;
                            return false;
                        })(), exceptionable, () => ({
                            path: path + $join(key),
                            expected: "undefined",
                            value: value
                        }))))
                    ];
                    return $predicate(Array.isArray(input) && input.every((elem, index1) => $predicate(null !== elem && $predicate("object" === typeof elem && null !== elem && $ao[0](elem, path + "[" + index1 + "]", true), true, () => ({
                        path: path + "[" + index1 + "]",
                        expected: "Resolve<IStorageData>",
                        value: elem
                    })), true, () => ({
                        path: path + "[" + index1 + "]",
                        expected: "Resolve<IStorageData>",
                        value: elem
                    }))), true, () => ({
                        path: path + "",
                        expected: "Array<Resolve<IStorageData>>",
                        value: input
                    }));
                })(input); return input; })(data);
                storage.data = data;
                console.timeEnd('Resume data');
            }
            if (fs.existsSync(fileNameError)) {
                console.time('Resume error');
                const error = (await fs.readJSON(fileNameError), 'utf8')
                    .split('\n')
                    .map((line) => JSON.parse(line));
                (input => { ((input, path = "$input") => {
                    const $predicate = TSON.assertEquals.predicate;
                    const $join = TSON.assertEquals.join;
                    const $ao = [
                        (input, path, exceptionable) => $predicate("number" === typeof input.timestamp, exceptionable, () => ({
                            path: path + ".timestamp",
                            expected: "number",
                            value: input.timestamp
                        })) && $predicate(undefined === input.data || "string" === typeof input.data, exceptionable, () => ({
                            path: path + ".data",
                            expected: "(string | undefined)",
                            value: input.data
                        })) && $predicate("parse" === input.error || "validate" === input.error || "port" === input.error || "readlineParser" === input.error, exceptionable, () => ({
                            path: path + ".error",
                            expected: "(\"parse\" | \"port\" | \"readlineParser\" | \"validate\")",
                            value: input.error
                        })) && $predicate("string" === typeof input.message, exceptionable, () => ({
                            path: path + ".message",
                            expected: "string",
                            value: input.message
                        })) && (false === exceptionable || Object.entries(input).every(([key, value]) => $predicate((() => {
                            if (undefined === value)
                                return true;
                            if (["timestamp", "data", "error", "message"].some(prop => key === prop))
                                return true;
                            return false;
                        })(), exceptionable, () => ({
                            path: path + $join(key),
                            expected: "undefined",
                            value: value
                        }))))
                    ];
                    return $predicate(Array.isArray(input) && input.every((elem, index1) => $predicate(null !== elem && $predicate("object" === typeof elem && null !== elem && $ao[0](elem, path + "[" + index1 + "]", true), true, () => ({
                        path: path + "[" + index1 + "]",
                        expected: "Resolve<IStorageError>",
                        value: elem
                    })), true, () => ({
                        path: path + "[" + index1 + "]",
                        expected: "Resolve<IStorageError>",
                        value: elem
                    }))), true, () => ({
                        path: path + "",
                        expected: "Array<Resolve<IStorageError>>",
                        value: input
                    }));
                })(input); return input; })(error);
                storage.error = error;
                console.timeEnd('Resume error');
            }
        }
        return Storage.instance;
    }
    /**
     * Store data
     *
     * @param inputLine Raw data to store
     * @param timestamp Timestamp of data
     */
    async storeDataLine(inputLine, timestamp) {
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
    async storeError(error, message, timestamp, data) {
        const errorObject = {
            timestamp,
            error,
            message,
            data,
        };
        await this.writeError(errorObject);
        console.warn('Got an error: ' + error, { errorObject });
    }
    /**
     * Store data on disk
     *
     * @param data data to store
     */
    async writeData(data) {
        await this.logRotate(data.timestamp);
        this.data.push(data);
        await fs.appendFile(fileNameData, JSON.stringify(data) + '\n');
    }
    /**
     * Store error on disk
     *
     * @param error error to store
     */
    async writeError(error) {
        await this.logRotate(error.timestamp);
        this.error.push(error);
        await fs.appendFile(fileNameError, JSON.stringify(error) + '\n');
    }
    /**
     * Returns filename for an error file.
     *
     * @param base timebase for string
     * @returns Filename for error file
     */
    getErrorFilename(base) {
        return base + '-error.json';
    }
    /**
     * Returns filename for a data file.
     *
     * @param base timebase for string
     * @returns Filename for data file
     */
    getDataFilename(base) {
        return base + '.json';
    }
    /**
     * Indicator to check if log roation should be applied
     *
     * @param timestamp New data timestamp
     */
    async logRotate(timestamp) {
        if (this.baseDate) {
            this.dayRotate(timestamp);
            await this.monthRotate(timestamp);
            this.baseDate = this.getDateString(timestamp);
        }
        else {
            this.baseDate = this.getDateString(timestamp);
        }
    }
    /**
     * Checks if logfile should be written to daily file
     *
     * @param timestamp New data timestamp
     */
    dayRotate(timestamp) {
        if (!this.baseDate) {
            return;
        }
        const newBase = this.getDateString(timestamp);
        const oldBase = this.baseDate;
        if (this.baseDate !== newBase) {
            const data = this.data;
            const error = this.error;
            this.data = [];
            this.error = [];
            fs.removeSync(fileNameData);
            fs.removeSync(fileNameError);
            if (data.length > 0) {
                const dataFilename = this.getDataFilename(oldBase);
                fs.writeJSONSync(path.join(activeStorage, dataFilename), data);
                this.index.add(dataFilename);
            }
            if (error.length > 0) {
                const errorFilename = this.getErrorFilename(oldBase);
                fs.writeJSONSync(path.join(activeStorage, errorFilename), error);
                this.index.add(errorFilename);
            }
            this.writeIndex();
        }
    }
    /**
     * Checks if logfile should be written to monthly file
     *
     * @param timestamp New data timestamp
     */
    async monthRotate(timestamp) {
        if (!this.baseDate) {
            return;
        }
        const newBase = dateFormat(timestamp, 'yyyy_mm');
        const oldBase = this.baseDate.match(/([0-9]{4}_[0-9]{2})_[0-9]{2}/)?.[1];
        if (newBase !== oldBase) {
            console.warn('Month from ' + oldBase + ' to ' + newBase);
            console.time('Month rotate');
            const filesData = (await fs.readdir(activeStorage))
                .filter((file) => file.match(oldBase + '_[0-9]{2}.json'));
            const fd = await fs.open(path.join(activeStorage, oldBase + '.json'), 'a');
            await fs.write(fd, '[');
            let first = true;
            for (const file of filesData) {
                const content = await fs.readJSON(path.join(activeStorage, file));
                if (first) {
                    await fs.write(fd, content.map(JSON.stringify).join(','));
                    first = false;
                }
                else {
                    await fs.write(fd, ',' + content.map(JSON.stringify).join(','));
                }
            }
            await fs.write(fd, ']');
            await fs.close(fd);
            filesData.forEach((file) => this.index.delete(file));
            this.index.add(oldBase + '.json');
            this.writeIndex();
            await Promise.all(filesData.map((file) => fs.remove(path.join(activeStorage, file))));
            console.timeEnd('Month rotate');
        }
    }
    /**
     * Updates index structures
     */
    writeIndex() {
        fs.writeJSONSync(fileNameIndex, [...this.index]);
    }
    /**
     * Parses the given input line. Either retrieves a data or error object.
     *
     * @param inputLine Data line from arduino
     * @param timestamp Optional timestamp of data (defaults to now)
     * @returns Object to store
     */
    async parseData(inputLine, timestamp) {
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
                await this.storeError('validate', valid.errors
                    .map((error) => error.path + ' --> Expect: ' + error.expected + '. Got: ' + error.value)
                    .join('\n'), timestamp, inputLine);
                return null;
            }
            return inputData;
        }
        catch (err) {
            await this.storeError('parse', err.message, timestamp, inputLine);
            return null;
        }
    }
    /**
     * Returns a file-formatted representation of the given timestamp.
     * Includes year, month and day
     *
     * @param timestamp Timestamp to format
     * @returns Formatted timestamp
     */
    getDateString(timestamp) {
        return dateFormat(timestamp, 'yyyy_mm_dd');
    }
}
export function validateTest() {
    validateTestDays();
    validateTestMonth();
}
/**
 * Simple validator for testdata
 */
async function validateTestDays() {
    const files = fs.readdirSync(activeStorage)
        .filter((file) => file.match(/[0-9]{4}_[0-9]{2}_[0-9]{2}.json/));
    for (const file of files) {
        try {
            const content = await fs.readJSON(path.join(activeStorage, file));
            (input => { const $out = {
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
                        })), $pred(Array.isArray(input.input) && input.input.map((elem, index2) => $pred(null !== elem && $pred("object" === typeof elem && null !== elem && $vo[1](elem, path + ".input[" + index2 + "]", true && exceptionable), exceptionable, () => ({
                            path: path + ".input[" + index2 + "]",
                            expected: "Resolve<__type>",
                            value: elem
                        })), exceptionable, () => ({
                            path: path + ".input[" + index2 + "]",
                            expected: "Resolve<__type>",
                            value: elem
                        }))).every(flag => true === flag), exceptionable, () => ({
                            path: path + ".input",
                            expected: "Array<Resolve<__type>>",
                            value: input.input
                        })), $pred(Array.isArray(input.output) && input.output.map((elem, index3) => $pred(null !== elem && $pred("object" === typeof elem && null !== elem && $vo[2](elem, path + ".output[" + index3 + "]", true && exceptionable), exceptionable, () => ({
                            path: path + ".output[" + index3 + "]",
                            expected: "Resolve<__type.o1>",
                            value: elem
                        })), exceptionable, () => ({
                            path: path + ".output[" + index3 + "]",
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
                return $pred(Array.isArray(input) && input.map((elem, index1) => $pred(null !== elem && $pred("object" === typeof elem && null !== elem && $vo[0](elem, path + "[" + index1 + "]", true), true, () => ({
                    path: path + "[" + index1 + "]",
                    expected: "Resolve<IStorageData>",
                    value: elem
                })), true, () => ({
                    path: path + "[" + index1 + "]",
                    expected: "Resolve<IStorageData>",
                    value: elem
                }))).every(flag => true === flag), true, () => ({
                    path: path + "",
                    expected: "Array<Resolve<IStorageData>>",
                    value: input
                }));
            })(input); return $out; })(content);
            let timestamp = content[0].timestamp;
            const base = dateFormat(timestamp, 'yyyy_mm_dd');
            if (base + '.json' !== file) {
                throw new Error('Incorrect entry found! ' + file + ', ' + base);
            }
            let count = 0;
            for (const data of content) {
                if (data.timestamp !== timestamp) {
                    throw new Error('Invalid timestamp! ' + file);
                }
                if (base !== dateFormat(data.timestamp, 'yyyy_mm_dd')) {
                    throw new Error('Entry in wrong file! ' + file);
                }
                timestamp += 2000;
                count++;
            }
            console.log('File ' + file + ' with ' + count + ' entries validated successfully');
        }
        catch (err) {
            console.warn('FAILED TO VALIDATE ' + file, { err });
        }
    }
}
/**
 * Simple validator for testdata
 */
async function validateTestMonth() {
    const files = fs.readdirSync(activeStorage)
        .filter((file) => file.match(/[0-9]{4}_[0-9]{2}.json/));
    for (const file of files) {
        try {
            const content = await fs.readJSON(path.join(activeStorage, file));
            (input => { const $out = {
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
                        })), $pred(Array.isArray(input.input) && input.input.map((elem, index2) => $pred(null !== elem && $pred("object" === typeof elem && null !== elem && $vo[1](elem, path + ".input[" + index2 + "]", true && exceptionable), exceptionable, () => ({
                            path: path + ".input[" + index2 + "]",
                            expected: "Resolve<__type>",
                            value: elem
                        })), exceptionable, () => ({
                            path: path + ".input[" + index2 + "]",
                            expected: "Resolve<__type>",
                            value: elem
                        }))).every(flag => true === flag), exceptionable, () => ({
                            path: path + ".input",
                            expected: "Array<Resolve<__type>>",
                            value: input.input
                        })), $pred(Array.isArray(input.output) && input.output.map((elem, index3) => $pred(null !== elem && $pred("object" === typeof elem && null !== elem && $vo[2](elem, path + ".output[" + index3 + "]", true && exceptionable), exceptionable, () => ({
                            path: path + ".output[" + index3 + "]",
                            expected: "Resolve<__type.o1>",
                            value: elem
                        })), exceptionable, () => ({
                            path: path + ".output[" + index3 + "]",
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
                return $pred(Array.isArray(input) && input.map((elem, index1) => $pred(null !== elem && $pred("object" === typeof elem && null !== elem && $vo[0](elem, path + "[" + index1 + "]", true), true, () => ({
                    path: path + "[" + index1 + "]",
                    expected: "Resolve<IStorageData>",
                    value: elem
                })), true, () => ({
                    path: path + "[" + index1 + "]",
                    expected: "Resolve<IStorageData>",
                    value: elem
                }))).every(flag => true === flag), true, () => ({
                    path: path + "",
                    expected: "Array<Resolve<IStorageData>>",
                    value: input
                }));
            })(input); return $out; })(content);
            let timestamp = content[0].timestamp;
            const base = dateFormat(timestamp, 'yyyy_mm');
            if (base + '.json' !== file) {
                throw new Error('Incorrect entry found! ' + file + ', ' + base);
            }
            let count = 0;
            for (const data of content) {
                if (data.timestamp !== timestamp) {
                    throw new Error('Invalid timestamp! ' + file);
                }
                if (base !== dateFormat(data.timestamp, 'yyyy_mm')) {
                    throw new Error('Entry in wrong file! ' + file);
                }
                timestamp += 2000;
                count++;
            }
            console.log('File ' + file + ' with ' + count + ' entries validated successfully');
        }
        catch (err) {
            console.warn('FAILED TO VALIDATE ' + file, { err });
        }
    }
}
