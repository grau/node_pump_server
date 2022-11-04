/**
 * @file A single zip file object
 */

import {Crc32} from './crc32';
import type {IFileStream} from './fileSource';

/** Shorthand type */
// eslint-disable-next-line no-undef
type TController = ReadableStreamDefaultController<Uint8Array> | TransformStreamDefaultController<Uint8Array>;

/**
 * Helper for array management
 */
interface IArrayView {
    /** Data array */
    array: Uint8Array;
    /** DataView for the same array */
    view: DataView;
}

/**
 * Single zip file object
 */
export class ZipObject {
    /** Header data */
    public header: IArrayView;

    /** Filename as byte array */
    public nameArr: Uint8Array;

    /** Comment as byte array */
    public commentArr: Uint8Array;

    /** Starting position of this zip object inside the zipFile */
    public startOffset = 0;

    /** CRC32 value of content */
    private crc: number = 0;

    /** Output controller to write to */
    private readonly ctrl: TController;

    /** The used file stream for this object */
    private readonly fileStream: IFileStream;

    /**
     * Default constructor
     *
     * @param ctrl Stream controller to enqueue data to
     * @param fileStream File stream object to pick data from
     */
    public constructor(ctrl: TController, fileStream: IFileStream) {
        const encoder = new TextEncoder();
        this.ctrl = ctrl;
        this.nameArr = encoder.encode(fileStream.filename);
        this.commentArr = encoder.encode(fileStream.comment ?? '');
        this.fileStream = fileStream;
        this.header = ZipObject.getArrayView(26);
    }

    /**
     * Returns a zip file file footer as byte array
     *
     * @param fileCount Number of files in this zip file
     * @param footerLength Size of footer (excluded this data)
     * @param bytePosition Byte position of footer start
     * @returns Byte array of file footer
     */
    public static getFileFooter(fileCount: number, footerLength: number, bytePosition: number): Uint8Array {
        const footerData = ZipObject.getArrayView(22);
        footerData.view.setUint32(0, 0x504b0506);
        footerData.view.setUint16(8, fileCount, true);
        footerData.view.setUint16(10, fileCount, true);
        footerData.view.setUint32(12, footerLength, true);
        footerData.view.setUint32(16, bytePosition, true);
        return footerData.array;
    }

    /**
     * Pure helper function.
     * Generates a uint8 array of the given size as well as a corresponding DataView object for this array
     *
     * @param byteLength Size of target array
     * @returns Object containint the uint8Array as well as an data view to array
     */
    private static getArrayView(byteLength: number): IArrayView {
        const uint8 = new Uint8Array(byteLength);
        return {
            array: uint8,
            view: new DataView(uint8.buffer),
        };
    }

    /**
     * Writes complete file to stream
     *
     * @param startOffset Starting position of this zip object inside the zipFile
     * @returns Size of this file including header and footer
     */
    public async writeFile(startOffset: number): Promise<number> {
        try {
            const headerSize = this.writeHeader(startOffset);
            const contentSize = await this.writeContent();
            const footerSize = this.writeFooter(contentSize);
            return headerSize + contentSize + footerSize;
        } catch (err: unknown) {
            this.error('Error while writing to stream: ', {err, file: this.fileStream});
            throw err;
        }
    }

    /**
     * Returns zip file footer data.
     *
     * @returns Zip footer data
     */
    public getFooterData(): Uint8Array {
        const data = ZipObject.getArrayView(46 + this.nameArr.length + this.commentArr.length);
        data.view.setUint32(0, 0x504b0102);
        data.view.setUint16(4, 0x1400);
        data.array.set(this.header.array, 6);
        data.view.setUint16(32, this.commentArr.length, true);
        data.view.setUint32(42, this.startOffset, true);
        data.array.set(this.nameArr, 46);
        data.array.set(this.commentArr, 46 + this.nameArr.length);
        return data.array;
    }

    /**
     * Writes header data to stream controller.
     *
     * @param offset File offset where we start at
     * @returns Number of bytes written
     */
    private writeHeader(offset: number): number {
        const header = this.header;
        const data = ZipObject.getArrayView(30 + this.nameArr.length);
        const date = new Date(this.fileStream.lastModified);
        this.startOffset = offset;

        header.view.setUint32(0, 0x14000808);
        header.view.setUint16(6, (date.getHours() << 6 | date.getMinutes()) << 5 | date.getSeconds() / 2, true);
        header.view.setUint16(8, (date.getFullYear() - 1980 << 4 | date.getMonth() + 1) << 5
            | date.getDate(), true);
        header.view.setUint16(22, this.nameArr.length, true);
        data.view.setUint32(0, 0x504b0304);
        data.array.set(header.array, 4);
        data.array.set(this.nameArr, 30);
        this.ctrl.enqueue(data.array);

        return data.array.length;
    }

    /**
     * Writes content data to stream controller.
     *
     * @returns If the chunk is done
     */
    private async writeContent(): Promise<number> {
        const reader = this.fileStream.stream?.getReader();
        if (! reader) {
            this.error('Could not open file reader for file ' + this.fileStream.filename);
            throw new Error('Could not open file reader for file ' + this.fileStream.filename);
        }
        const crc32 = new Crc32();

        let contentSize = 0;
        for (let chunk = await reader.read(); ! chunk.done; chunk = await reader.read()) {
            const outputData = chunk.value;
            crc32.append(outputData);
            contentSize += outputData.length;
            this.ctrl.enqueue(outputData);
        }
        this.crc = crc32.get();
        return contentSize;
    }

    /**
     * Writes footer data to stream controller.
     *
     * @param contentSize Byte size of file content
     * @returns Size of content plus footer
     */
    private writeFooter(contentSize: number): number {
        if (this.header === undefined || this.header === null) {
            this.error('No header data present. Please write header before footer!');
        }

        const footer = ZipObject.getArrayView(16);
        footer.view.setUint32(0, 0x504b0708);

        this.header.view.setUint32(10, this.crc, true);
        this.header.view.setUint32(14, contentSize, true); // Compressed length
        this.header.view.setUint32(18, contentSize, true); // Uncompressed length

        footer.view.setUint32(4, this.crc, true);
        footer.view.setUint32(8, contentSize, true); // Compressed length
        footer.view.setUint32(12, contentSize, true); // Uncompressed length

        this.ctrl.enqueue(footer.array);
        return 16;
    }

    /**
     * Calls an error
     *
     * @param message Error message
     * @param err Optional error object
     */
    private error(message: string, err?: unknown): void {
        this.ctrl.error(message);
        if (err instanceof Error) {
            throw err;
        } else {
            throw new Error(message);
        }
    }
}
