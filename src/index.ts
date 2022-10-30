/**
 * @file Entry point
 */
import { mainQueue, writeTestData } from './fetchAndStore/index.js';
import { startWebServer } from './serve/index.js';

Promise.all([
    writeTestData(),
    // mainQueue(),
    startWebServer(),
])
    .catch((err) => {
        console.warn('Main loop failed! Shuttding down', {err});
        // eslint-disable-next-line no-undef
        process.exit(1);
    });
