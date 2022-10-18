/**
 * @file Entry point
 */
import { mainQueue } from './fetchAndStore/index.js';
import { startWebServer } from './serve/index.js';

await Promise.all([
    mainQueue(),
    startWebServer(),
]);
