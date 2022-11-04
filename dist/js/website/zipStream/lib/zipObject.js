/**
 * @file A single zip file object
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
import { Crc32 } from './crc32';
/**
 * Single zip file object
 */
export class ZipObject {
    /**
     * Default constructor
     *
     * @param ctrl Stream controller to enqueue data to
     * @param fileStream File stream object to pick data from
     */
    constructor(ctrl, fileStream) {
        var _a;
        /** Starting position of this zip object inside the zipFile */
        this.startOffset = 0;
        /** CRC32 value of content */
        this.crc = 0;
        const encoder = new TextEncoder();
        this.ctrl = ctrl;
        this.nameArr = encoder.encode(fileStream.filename);
        this.commentArr = encoder.encode((_a = fileStream.comment) !== null && _a !== void 0 ? _a : '');
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
    static getFileFooter(fileCount, footerLength, bytePosition) {
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
    static getArrayView(byteLength) {
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
    writeFile(startOffset) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const headerSize = this.writeHeader(startOffset);
                const contentSize = yield this.writeContent();
                const footerSize = this.writeFooter(contentSize);
                return headerSize + contentSize + footerSize;
            }
            catch (err) {
                this.error('Error while writing to stream: ', { err, file: this.fileStream });
                throw err;
            }
        });
    }
    /**
     * Returns zip file footer data.
     *
     * @returns Zip footer data
     */
    getFooterData() {
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
    writeHeader(offset) {
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
    writeContent() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const reader = (_a = this.fileStream.stream) === null || _a === void 0 ? void 0 : _a.getReader();
            if (!reader) {
                this.error('Could not open file reader for file ' + this.fileStream.filename);
                throw new Error('Could not open file reader for file ' + this.fileStream.filename);
            }
            const crc32 = new Crc32();
            let contentSize = 0;
            for (let chunk = yield reader.read(); !chunk.done; chunk = yield reader.read()) {
                const outputData = chunk.value;
                crc32.append(outputData);
                contentSize += outputData.length;
                this.ctrl.enqueue(outputData);
            }
            this.crc = crc32.get();
            return contentSize;
        });
    }
    /**
     * Writes footer data to stream controller.
     *
     * @param contentSize Byte size of file content
     * @returns Size of content plus footer
     */
    writeFooter(contentSize) {
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
    error(message, err) {
        this.ctrl.error(message);
        if (err instanceof Error) {
            throw err;
        }
        else {
            throw new Error(message);
        }
    }
}
