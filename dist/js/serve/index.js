/**
 * @file Webserver to provide data
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
import express from 'express';
import { dataStorage } from '../config.js';
/** Supported download formats */
export const downloadFormats = ['csv', 'xlsx', 'json'];
/**
 * Starts http server. Servers all files
 */
export function startWebServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        const port = 3000;
        app.use('/', express.static('./site'));
        app.use('/data', express.static(dataStorage));
        app.listen(port, () => {
            console.info('Webserver active on Port ' + port);
        });
    });
}
