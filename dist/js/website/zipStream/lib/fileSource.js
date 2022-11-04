/**
 * @file Controller component used by the stream stream zip data
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
import delay from 'delay';
import { getUint8Transformer } from './toUint8Transformer';
/**
 * Source helper for filestream.
 */
// eslint-disable-next-line no-undef
export class FileSource {
    /**
     * Base constructor
     *
     * @param files Array of file objects that should be added to zip.
     */
    constructor(files) {
        /** Active position in file list */
        this.position = 0;
        /** All files to provide */
        this.files = [];
        /** If the stream should abort / cancel at the next possible occasion */
        this.shouldAbort = false;
        /** Entries regarding the state of file transfers */
        this.logEntries = [];
        /** Listener thats called when job is done */
        this.onFinish = () => { };
        /** Listener thats called when something has changed */
        this.onChange = () => { };
        /** Listener thats called on error */
        this.onError = () => { };
        /** Listener thats called on minor, revocerable errors */
        this.onWarn = () => { };
        this.files.push(...files);
    }
    /** Command to abort the process at the next possible occation */
    abort() {
        this.shouldAbort = true;
    }
    /**
     * Function called to fetch new data
     *
     * @param ctrl Backchannel to communicate with stream
     */
    // eslint-disable-next-line no-undef
    pull(ctrl) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            while (this.position < this.files.length && !this.shouldAbort) {
                const startTime = Date.now();
                const file = this.files[this.position];
                const lastModified = (_a = file.lastModified) !== null && _a !== void 0 ? _a : Date.now();
                const filename = file.filename.trim();
                const comment = file.comment;
                try {
                    const stream = file.errorReport
                        ? new Response(yield file.errorReport(this.logEntries)).body
                        : yield this.getStream(file.content);
                    ctrl.enqueue({
                        filename,
                        stream,
                        comment,
                        lastModified,
                    });
                    this.onChange();
                    this.position++;
                    this.logEntries.push({
                        startTime,
                        filename,
                        endTime: Date.now(),
                    });
                    return;
                }
                catch (err) {
                    this.onWarn(new Error('Could not open/enqueue stream'));
                    this.onChange();
                    this.position++;
                    this.logEntries.push({
                        startTime,
                        filename,
                        endTime: Date.now(),
                        errorstring: err.message,
                    });
                    yield delay(1);
                }
            }
            ctrl.close();
            this.onFinish();
        });
    }
    /**
     * Return number of files.
     *
     * @returns Numer of files
     */
    getFileCount() {
        return this.files.length;
    }
    /**
     * Return number of files.
     *
     * @returns Numer of files
     */
    getPosition() {
        return this.position;
    }
    /**
     * Return filename in progress.
     *
     * @returns Filename
     */
    getFilename() {
        const { position, files } = this;
        return position < files.length ? files[position].filename : '';
    }
    /**
     * Returns a readable data stream for the given content function.
     * On errors emtpy files are generated.
     *
     * @param contentFu Function generating the content
     * @returns Readable data stream
     */
    getStream(contentFu) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield contentFu();
            const stream = content instanceof ReadableStream
                ? getUint8Transformer(content)
                : content instanceof Response
                    ? content.body
                    : new Response(content).body;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return stream !== null && stream !== void 0 ? stream : new Response('').body;
        });
    }
}
