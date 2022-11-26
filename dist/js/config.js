/**
 * @file Config options
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/** Location of data storage */
export const dataStorage = join(__dirname, 'data');
