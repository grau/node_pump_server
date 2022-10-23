/**
 * @file Some (simple) system stats
 */

import checkDiskSpace from 'check-disk-space';
import type { DiskSpace } from 'check-disk-space';

import os from 'os';
import fs from 'fs-extra';

import { dbLocation } from './storage-mysql.js';

/** Amount of data held in local storage (6 hrs) */
const pufferLength = 6 * 60;

/** System stats */
export interface ISystemData {
    /** Timestamp of data */
    timestamp: number;
    /** Disk space data */
    diskSpace: DiskSpace;
    /** CPU info */
    cpus: os.CpuInfo[];
    /** Database size */
    dbSize: number;
    /** Memory usage */
    mem: {
        total: number;
        free: number;
    }
}

/**
 * Some simple system stats
 *
 * @todo Add ringbuffer logic for data and error
 */
export class System {
    /** The one storage instance */
    private static instance?: System;

    /** All data objects */
    public data: ISystemData[];

    /**
     * Base constructor
     */
    private constructor() {
        this.data = [];
        this.updateData()
            .catch((err) => console.warn('Failed to gather system stats', {err}));
        setInterval(() => this.updateData(), 60000);
    }

    /**
     * Returns storage instance.
     *
     * @returns Storage instance
     */
    public static getInstance(): System {
        if (System.instance === undefined) {
            const system = new System();
            System.instance = system;
        }
        return System.instance;
    }

    /**
     * Updates locally stored data
     */
    private async updateData(): Promise<void> {
        const data = await this.getData();
        this.data.push(data);
        if (this.data.length > pufferLength) {
            this.data.shift();
        }
    }

    /**
     * Gather some system data and write it to array
     */
    private async getData(): Promise<ISystemData> {
        return {
            timestamp: Date.now(),
            diskSpace: await checkDiskSpace('/'),
            cpus: os.cpus(),
            dbSize: fs.statSync(dbLocation).size,
            mem: {
                total: os.totalmem(),
                free: os.freemem(),
            },
        };
    }
}
