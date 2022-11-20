/**
 * @file Returns cpu usage information in a USABLE format x_x
 */
import os from 'os';

let cpuOld: os.CpuInfo['times'] = os.cpus()[0].times;
export let cpuTimes: [number, number, number, number] = [1,0,0,0];

/**
 * Starts an endless interval to update the cpuinfo
 */
export function initCpuInfoUpdater(): void {
    setInterval(() => {
        const cpuNow = getMeanCpu(os.cpus());
        cpuTimes = timesToArr(getCpuDiff(cpuOld, cpuNow));
        cpuOld = cpuNow;
    }, 1000);
}

/**
 * Transforms times object to times array
 *
 * @param times Times object
 * @returns Times array order as idle, irq, nice, sys, user.
 */
function timesToArr(times: os.CpuInfo['times']): [number, number, number, number] {
    return [times.idle, times.irq, times.sys, times.user];
}

/**
 * Returns mean cpu-times
 *
 * @param cpus Multi-Cpu cpu data
 * @returns mean cpu times
 */
function getMeanCpu(cpus: os.CpuInfo[]): os.CpuInfo['times'] {
    const retVal: os.CpuInfo['times'] = cpus[0].times;
    for (let i = 1; i < cpus.length; i++) {
        const cpu = cpus[i];
        retVal.idle += cpu.times.idle;
        retVal.irq += cpu.times.irq;
        retVal.nice += cpu.times.nice;
        retVal.sys += cpu.times.sys;
        retVal.user += cpu.times.user;
    }
    return {
        idle: retVal.idle / cpus.length,
        irq: retVal.irq / cpus.length,
        nice: retVal.nice / cpus.length,
        sys: retVal.sys / cpus.length,
        user: retVal.user / cpus.length,
    };
}

/**
 * Diff old times with new times
 *
 * @param timesOld Old times
 * @param timesNow New times
 * @returns Time diff
 */
function getCpuDiff(timesOld: os.CpuInfo['times'], timesNow: os.CpuInfo['times']): os.CpuInfo['times'] {
    return {
        idle: Math.floor(timesNow.idle - timesOld.idle),
        irq: Math.floor(timesNow.irq - timesOld.irq),
        nice: Math.floor(timesNow.nice - timesOld.nice),
        sys: Math.floor(timesNow.sys - timesOld.sys),
        user: Math.floor(timesNow.user - timesOld.user),
    };
}
