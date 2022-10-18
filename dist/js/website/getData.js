/**
 * @file Api connector to get data
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
/**
 * Returns cached data
 *
 * @param from Timestamp to start from
 * @returns Cached data
 */
export function getCachedData(from) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = '/getDataCache';
        if (from !== undefined) {
            url = url + '?from=' + from;
        }
        return (yield fetch(url)).json();
    });
}
/**
 * Returns cached data
 *
 * @param from Timestamp to start from
 * @param samples Number of samples to return
 * @returns Cached data
 */
export function getCachedDataSeries(from, samples = 200) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = new URLSearchParams();
        if (from !== undefined) {
            params.append('from', String(from));
        }
        if (samples !== undefined) {
            params.append('samples', String(samples));
        }
        return (yield fetch('/getDataCacheSeries?' + params.toString())).json();
    });
}
/**
 * Returns cached data
 *
 * @param from Timestamp to start from
 * @param to Timestamp to end at
 * @returns Cached data
 */
export function getData(from, to) {
    return __awaiter(this, void 0, void 0, function* () {
        const searchParams = new URLSearchParams();
        if (from !== undefined) {
            searchParams.append('from', String(from));
        }
        if (to !== undefined) {
            searchParams.append('t', String(to));
        }
        const url = '/getData?' + searchParams.toString();
        return (yield fetch(url)).json();
    });
}
/**
 * Returns cached data
 *
 * @param from Timestamp to start from
 * @param to Timestamp to end at
 * @param samples Number of samples to return
 * @returns Cached data
 */
export function getDataSeries(from, to, samples = 200) {
    return __awaiter(this, void 0, void 0, function* () {
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
        return (yield fetch(url)).json();
    });
}
/**
 * Get the lowest timestamp in database
 *
 * @returns Lowest timestamp in database
 */
export function getMinDate() {
    return __awaiter(this, void 0, void 0, function* () {
        return parseInt(yield (yield fetch('/getMinDate')).text());
    });
}
