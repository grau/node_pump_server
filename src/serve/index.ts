/**
 * @file Webserver to provide data
 */

import express from 'express';
import { dataStorage } from '../config.js';

/** Supported download formats */
export const downloadFormats = ['csv', 'xlsx', 'json'] as const;
/**
 *
 */
export type TDownloadFormats = typeof downloadFormats[number];

/**
 * Starts http server. Servers all files
 */
export async function startWebServer(): Promise<void> {
    const app = express();
    const port = 3000;

    app.use('/', express.static('./site'));

    app.use('/data', express.static(dataStorage));

    app.listen(port, () => {
        console.info('Webserver active on Port ' + port);
    });
}
