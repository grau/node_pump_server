/**
 * @file Entry point
 */
import { writeTestData } from './fetchAndStore/index.js';
import { startWebServer } from './serve/index.js';

await Promise.all([
    writeTestData(),
    startWebServer(),
]);
