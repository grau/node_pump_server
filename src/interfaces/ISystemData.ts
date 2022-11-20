/**
 * @file System stats
 */

import type { DiskSpace } from 'check-disk-space';

/** System stats */
export interface ISystemData {
    /** Timestamp of data */
    timestamp: number;
    /** Disk space data */
    diskSpace: DiskSpace;
    /** mean CPU info over 1 second. idle, irq, nice, sys, user */
    cpuTimes: [number, number, number, number];
    /** Database size */
    dbSize: number;
    /** Memory usage */
    mem: {
        total: number;
        free: number;
    };
    /** Number of seconds this box is running */
    uptime: number;
}
