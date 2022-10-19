/**
 * @file Some (simple) system stats
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
import checkDiskSpace from 'check-disk-space';
import os from 'os';
import fs from 'fs-extra';
import { dbLocation } from './storage.js';
/** Amount of data held in local storage (6 hrs) */
const pufferLength = 6 * 60;
/**
 * Some simple system stats
 *
 * @todo Add ringbuffer logic for data and error
 */
export class System {
    /**
     * Base constructor
     */
    constructor() {
        this.data = [];
        this.updateData()
            .catch((err) => console.warn('Failed to gather system stats', { err }));
        setInterval(() => this.updateData(), 60000);
    }
    /**
     * Returns storage instance.
     *
     * @returns Storage instance
     */
    static getInstance() {
        if (System.instance === undefined) {
            const system = new System();
            System.instance = system;
        }
        return System.instance;
    }
    /**
     * Updates locally stored data
     */
    updateData() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getData();
            this.data.push(data);
            if (this.data.length > pufferLength) {
                this.data.shift();
            }
        });
    }
    /**
     * Gather some system data and write it to array
     */
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                timestamp: Date.now(),
                diskSpace: yield checkDiskSpace('/'),
                cpus: os.cpus(),
                dbSize: fs.statSync(dbLocation).size,
                mem: {
                    total: os.totalmem(),
                    free: os.freemem(),
                },
            };
        });
    }
}
