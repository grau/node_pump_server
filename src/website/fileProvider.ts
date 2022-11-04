/**
 * @file Functions to provide files
 */
import * as XLSX from 'xlsx';

import { db } from './database';

/**
 * Returns data as csv
 *
 * @param from Start timestamp
 * @param to End timestamp
 */
export async function getCsv(from: number, to: number): Promise<string> {
    const rows = await db.getData(from, to);
    return rows.map((row) => [
        row.timestamp,
        row.input[0].val,
        row.input[1].val,
        row.input[2].val,
        row.input[3].val,
        row.output[0].val,
        row.output[1].val,
        row.boot,
        row.state,
    ].join(';')).join('\n');
}

/**
 * Returns data as json
 *
 * @param from Start timestamp
 * @param to End timestamp
 */
export async function getJSON(from: number, to: number): Promise<string> {
    console.warn('GETTING DATA ROWS');
    const rows = await db.getData(from, to);
    console.warn('STRINGIFY');
    return JSON.stringify(rows, null, 2);
}

/**
 * Returns data as json
 *
 * @param from Start timestamp
 * @param to End timestamp
 */
export async function getExcel(from: number, to: number): Promise<string> {
    const rows = await db.getData(from, to);
    const data = rows.map(({timestamp, input, output, boot, state}) => ({
        timestamp,
        input0: input[0].val,
        input1: input[1].val,
        input2: input[2].val,
        input3: input[3].val,
        output0: output[0].val,
        output1: output[1].val,
        boot,
        state,
    }));
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    return XLSX.writeXLSX(workbook, {type: 'binary'});

}

/**
 * Starts a javascript download
 *
 * @param content File content
 * @param filename File name
 */
export function download(content: string, filename: string): void {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
