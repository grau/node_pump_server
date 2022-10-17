/**
 * @file Api connector to get data
 */

import type { ISeriesData } from '../interfaces/IStorage';
import type { IStorageData } from '../interfaces/IData';

/**
 * Returns cached data
 *
 * @param from Timestamp to start from
 * @returns Cached data
 */
export async function getCachedData(from?: number): Promise<IStorageData[]> {
    let url = '/getDataCache';
    if (from !== undefined) {
        url = url + '?from=' + from;
    }
    return (await fetch(url)).json();
}

/**
 * Returns cached data
 *
 * @param from Timestamp to start from
 * @param samples Number of samples to return
 * @returns Cached data
 */
export async function getCachedDataSeries(from?: number, samples: number = 200): Promise<ISeriesData> {
    const params = new URLSearchParams();
    if (from !== undefined) {
        params.append('from', String(from));
    }
    if (samples !== undefined) {
        params.append('samples', String(samples));
    }
    return (await fetch('/getDataCacheSeries?' + params.toString())).json();
}

/**
 * Returns cached data
 *
 * @param from Timestamp to start from
 * @param to Timestamp to end at
 * @returns Cached data
 */
export async function getData(from?: number, to?: number): Promise<IStorageData[]> {
    const searchParams = new URLSearchParams();
    if (from !== undefined) {
        searchParams.append('from', String(from));
    }
    if (to !== undefined) {
        searchParams.append('t', String(to));
    }
    const url = '/getData?' + searchParams.toString();
    return (await fetch(url)).json();
}

/**
 * Returns cached data
 *
 * @param from Timestamp to start from
 * @param to Timestamp to end at
 * @param samples Number of samples to return
 * @returns Cached data
 */
export async function getDataSeries(from?: number, to?: number, samples: number = 200): Promise<ISeriesData> {
    const searchParams = new URLSearchParams();
    if (from !== undefined) {
        searchParams.append('from', String(from));
    }
    if (to !== undefined) {
        searchParams.append('t', String(to));
    }
    if (samples !== undefined) {
        searchParams.append('samples', String(samples));
    }
    const url = '/getDataSeries?' + searchParams.toString();
    return (await fetch(url)).json();
}

/**
 * Get the lowest timestamp in database
 *
 * @returns Lowest timestamp in database
 */
export async function getMinDate(): Promise<number> {
    return parseInt(await (await fetch('/getMinDate')).text());
}
