/**
 * Common helper fuctions that do not really belong in any other module.
 * More or less a "utility module"
 *
 * @file
 */

import * as dateFormat from 'dateformat';

dateFormat.i18n.dayNames = [
    'So',
    'Mo',
    'Di',
    'Mi',
    'Do',
    'Fr',
    'Sa',
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
];
dateFormat.i18n.monthNames = [
    'Jan',
    'Feb',
    'Mär',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
];

/**
 * Time intervalls for formatTimeDuration
 */
interface IIntervalls {
    /** Max range of this intervall */
    max: number;
    /** Division to apply before showing */
    div: number;
    /** Suffix of this intervall */
    title: string;
}

/**
 * List of time / duration intervalls for the formatTimeDuration function
 */
const timeDurationIntervalls: IIntervalls[] = [
    {
        max: 1000,
        div: 1,
        title: 'milli Sekunde(n)'},
    {
        max: 1000 * 60,
        div: 1000,
        title: 'Sekunde(n)'},
    {
        max: 1000 * 60 * 60,
        div: 1000 * 60,
        title: 'Minute(n)'},
    {
        max: 1000 * 60 * 60 * 24,
        div: 1000 * 60 * 60,
        title: 'Stunde(n)'},
    {
        max: 1000 * 60 * 60 * 24 * 7,
        div: 1000 * 60 * 60 * 24,
        title: 'Tag(e)'},
    {
        max: 1000 * 60 * 60 * 24 * 30,
        div: 1000 * 60 * 60 * 24 * 7,
        title: 'Woche(n)'},
    {
        max: 1000 * 60 * 60 * 24 * 356,
        div: 1000 * 60 * 60 * 24 * 30,
        title: 'Monat(e)'},
    {
        max: Number.MAX_VALUE,
        div: 1000 * 60 * 60 * 24 * 356,
        title: 'Jahr(e)'},
];

/**
 * Formats a date nice and human friendly
 *
 * @param timestamp Javascript timestamp as input (defaults to now)
 * @returns Human friendly timestamp string
 */
export function formatDate(timestamp: number = Date.now()): string {
    return dateFormat.default(timestamp, 'ddd d. mmm yyyy, HH:MM:ss');
}

/**
 * Formats a date nice and human friendly
 * Short version. Same day: Only time. Other day: Only date.
 *
 * @param timestamp Javascript timestamp as input (defaults to now)
 * @returns Human friendly timestamp string
 */
export function formatDateShort(timestamp: number = Date.now()): string {
    const dateOnly = dateFormat.default(timestamp, 'ddd d. mmm yyyy');
    if (dateOnly === dateFormat.default(Date.now(), 'ddd d. mmm yyyy')) {
        return dateFormat.default(timestamp, 'HH:MM:ss');
    } else {
        return dateOnly;
    }
}

/**
 * Formats a date for usage in filenames
 *
 * @param timestamp Javascript timestamp as input (defaults to now)
 * @returns File friendlich timestamp string
 */
export function formatDateFilename(timestamp: number = Date.now()): string {
    return dateFormat.default(timestamp, 'yyyy_mm_dd_HH_MM_ss');
}

/**
 * Takes a duration in ms and returns a string in human readable
 * (86400 === 1 day)
 *
 * @param time duration in ms
 * @returns human readable time format
 */
export function formatTimeDuration(time: number): string {
    const div = (divisor: number): number => Math.floor(time / divisor * 10) / 10;

    for (const intervall of timeDurationIntervalls) {
        if (time < intervall.max) {
            return String(div(intervall.div)) + ' ' + intervall.title;
        }
    }
    throw new Error('(formatTimeDuration) Impossible overflow');
}

/**
 * Properly formats a file size (eg 1234567 bytes ==> 1.23 MB)
 * 1000 is used as byte base
 *
 * @param bytes Input number as bytes
 * @returns Human friendly representation
 */
export function formatByteSize(bytes: number): string {
    let compare = 1000;
    const units = [' B', ' kB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB'];
    for (const unit of units) {
        if (bytes <= compare) {
            return String(roundBy(bytes * 1000 / compare)) + unit;
        }
        compare *= 1000;
    }
    return String(roundBy(bytes * 1000 / compare)) + ' YB';
}

/**
 * Rounds the given number to the given digit count.
 * If no digit number is given, 2 is assumed
 *
 * @param number number to round
 * @param digits number of digits
 * @returns rounded number
 */
export function roundBy(number: number, digits: number = 2): number {
    return Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);
}

/**
 * Fetch a remote url and returns data as json.
 *
 * @param url URL to fetch.
 * @returns Arbitrary json object
 * @throws on parsing error or unavailable site
 */
export async function fetchJson(url: string): Promise<unknown> {
    const result = await fetch(url);
    return (await result.json()) as unknown;
}

/**
 * Fetch a remote url and returns data as string.
 *
 * @param url URL to fetch.
 * @returns Content of site
 * @throws on unavailable site
 */
export async function fetchString(url: string): Promise<string> {
    const result = await fetch(url);
    return result.text();
}

/**
 * Fetch a remote url and returns data as blob
 *
 * @param url Url to fetch data from
 * @returns Blob
 * @throws on unavailable site
 */
export async function fetchBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (response.status === 200) {
        return response.blob();
    } else {
        throw new Error('No blob');
    }
}


/**
 * Auto starts download of file with given data
 *
 * @param data Binary data for download
 * @param filename Filename for download.
 * @param mimeType Mime type of download. Defaults to "octet-stream" which means arbitrary binary.
 */
export function startDataDownload(data: Uint8Array | string | Blob, filename: string,
    mimeType: string = 'application/octet-stream'): void {
    const element = document.createElement('a');
    const blob = data instanceof Blob ? data : new Blob([data], {type: mimeType});
    element.setAttribute('href', window.URL.createObjectURL(blob));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * Reads from the given file object and returns content as string
 *
 * @param file File object to read from
 * @returns content of file as string
 */
export async function getFileContent(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.addEventListener('load', (event) => {
            if (event.target?.result !== null && event.target?.result !== undefined) {
                resolve(event.target.result as string);
            } else {
                reject('Error while file reading');
            }
        });
        reader.addEventListener('error', () => {
            reject('Error while file reading');
        });
        reader.readAsText(file);
    });
}

/**
 * Checks if the given text is a valid json expression
 *
 * @param text Expression to check
 * @returns If text is valid json
 */
export function isValidJson(text: string): boolean {
    try {
        JSON.parse(text);
        return true;
    } catch {
        return false;
    }
}

/**
 * Starts a file download
 *
 * @param data Data blob / string to download
 * @param filename Filename to download
 * @param mime Mimetype for download
 */
export function fileDownload(data: string | ArrayBuffer | ArrayBufferView | Blob, filename: string,
    mime: string = 'application/octet-stream'): void {
    const blob = new Blob([ data ], {type: mime});

    const blobUrl = window.URL?.createObjectURL !== undefined
        ? window.URL.createObjectURL(blob)
        : window.webkitURL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = blobUrl;
    tempLink.setAttribute('download', filename);

    // Safari thinks _blank anchor are pop ups. We only want to set _blank
    // target if the browser does not support the HTML5 download attribute.
    // This allows you to download files in desktop safari if pop up blocking
    // is enabled.
    if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
    }

    document.body.appendChild(tempLink);
    tempLink.click();

    // Fixes "webkit blob resource error 1"
    setTimeout(() => {
        document.body.removeChild(tempLink);
        window.URL.revokeObjectURL(blobUrl);
    }, 200);
}

/**
 * Generates a small, random string
 *
 * There is a npm for this (randomstring) which repeatedly crashes (infinite loop).
 * The reason is unknown - but just importing and starting was enough.
 * Therefore this simple solution.
 *
 * @returns Some random characters.
 */
export function getRandomString(): string {
    // Parameter of toString is radix. Radix 36 means all characters.
    // @see https://gist.github.com/6174/6062387
    return Math.random().toString(36).substring(2);
}

/**
 * Turns the given svg image (as file) into a png file.
 * Returns the png file
 *
 * @param svgElem SVG Element
 * @returns PNG image
 * @throws In case of unsupported canvas 2d
 */
export async function getPngFromSvg(svgElem: SVGSVGElement): Promise<Blob> {
    const svgString = new XMLSerializer().serializeToString(svgElem);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('2D Canvas not supported. Could not transform svg to png');
    }
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const objectUrl = URL.createObjectURL(svgBlob);
    const img = new Image();
    const promise = new Promise<Blob>((resolve, reject) => {
        img.onload = (): void => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob === undefined || blob === null) {
                    reject('Canvas did not resolve to blob');
                } else {
                    resolve(blob);
                }
            }, 'image/png', 1);
        };
        img.onerror = (): void => {
            reject('Failed to transform image');
        };
    });
    img.src = objectUrl;
    const ratio = svgElem.getBBox().width / svgElem.getBBox().height;
    const newHeight = Math.max(1600, svgElem.getBBox().height);
    img.height = newHeight;
    img.width = ratio * newHeight;
    return promise;
}
