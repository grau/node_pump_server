/**
 * @file Transform stream to transform an FileSource stream to a byte stream
 */

import {ZipObject} from './zipObject';
import {FileSource} from './fileSource';
import type {IFileInput, IFileStream} from './fileSource';

/**
 * Transform stream transformer which takes IFileStream objects, reads their content and outputs a byte array to feed
 * to a file for instance. No compression is supported
 */
export class ZipTransformer implements Transformer<IFileStream, Uint8Array> {
    /** Set of filenames to detect duplicates */
    private readonly filenames = new Set<string>();

    /** Position inside zip file to write to */
    private bytePosition = 0;

    /** Size of footer. Incremented per file */
    private footerLength: number = 0;

    /** All file footers */
    private readonly footerData: Uint8Array[] = [];

    /**
     * Called when a chunk written to the writable side is ready to be transformed, and performs the work of the
     * transformation stream.
     *
     * Writes a single file to the zip stream
     *
     * @param file File to write
     * @param controller Output controller to write to
     */
    public async transform(file: IFileStream, controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {
        const activeZipObject = new ZipObject(controller, file);

        if (this.filenames.has(file.filename)) {
            throw new Error('File ' + file.filename + ' already exists');
        } else {
            this.filenames.add(file.filename);
        }
        const fileSize = await activeZipObject.writeFile(this.bytePosition);
        this.bytePosition += fileSize;
        this.footerLength += 46 + activeZipObject.nameArr.length + activeZipObject.commentArr.length;
        this.footerData.push(activeZipObject.getFooterData());
    }

    /**
     * Called after all chunks written to the writable side have been successfully transformed, and the writable side
     * is about to be closed.
     *
     * Writes the ZIP footer.
     *
     * @param controller Output controller to write to
     */
    public flush(controller: TransformStreamDefaultController<Uint8Array>): void {
        for (const footerData of this.footerData) {
            controller.enqueue(footerData);
        }
        controller.enqueue(ZipObject.getFileFooter(this.filenames.size, this.footerLength,
            this.bytePosition));
    }
}

/**
 * Shortcut to create a zip stream from an array of files
 *
 * @param files Files to put into zip
 * @returns Readable stream to read zip from
 */
export function getZipStream(files: IFileInput[]): ReadableStream<Uint8Array> {
    return new ReadableStream(new FileSource(files))
        .pipeThrough(new TransformStream(new ZipTransformer()));
}
