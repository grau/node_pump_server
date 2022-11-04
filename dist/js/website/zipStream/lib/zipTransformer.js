/**
 * @file Transform stream to transform an FileSource stream to a byte stream
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
import { ZipObject } from './zipObject';
import { FileSource } from './fileSource';
/**
 * Transform stream transformer which takes IFileStream objects, reads their content and outputs a byte array to feed
 * to a file for instance. No compression is supported
 */
export class ZipTransformer {
    constructor() {
        /** Set of filenames to detect duplicates */
        this.filenames = new Set();
        /** Position inside zip file to write to */
        this.bytePosition = 0;
        /** Size of footer. Incremented per file */
        this.footerLength = 0;
        /** All file footers */
        this.footerData = [];
    }
    /**
     * Called when a chunk written to the writable side is ready to be transformed, and performs the work of the
     * transformation stream.
     *
     * Writes a single file to the zip stream
     *
     * @param file File to write
     * @param controller Output controller to write to
     */
    transform(file, controller) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeZipObject = new ZipObject(controller, file);
            if (this.filenames.has(file.filename)) {
                throw new Error('File ' + file.filename + ' already exists');
            }
            else {
                this.filenames.add(file.filename);
            }
            const fileSize = yield activeZipObject.writeFile(this.bytePosition);
            this.bytePosition += fileSize;
            this.footerLength += 46 + activeZipObject.nameArr.length + activeZipObject.commentArr.length;
            this.footerData.push(activeZipObject.getFooterData());
        });
    }
    /**
     * Called after all chunks written to the writable side have been successfully transformed, and the writable side
     * is about to be closed.
     *
     * Writes the ZIP footer.
     *
     * @param controller Output controller to write to
     */
    flush(controller) {
        for (const footerData of this.footerData) {
            controller.enqueue(footerData);
        }
        controller.enqueue(ZipObject.getFileFooter(this.filenames.size, this.footerLength, this.bytePosition));
    }
}
/**
 * Shortcut to create a zip stream from an array of files
 *
 * @param files Files to put into zip
 * @returns Readable stream to read zip from
 */
export function getZipStream(files) {
    return new ReadableStream(new FileSource(files))
        .pipeThrough(new TransformStream(new ZipTransformer()));
}
