/**
 * @file Transform stream to transform streams from other formats to uint8array streams
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TransformStream
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
export class ToUint8Transformer {
    /**
     * Called when a chunk written to the writable side is ready to be transformed, and performs the work of the
     * transformation stream.
     *
     * Transforms quite anything to uint8array
     *
     * @param chunk Data to wrote
     * @param controller Output controller to write to
     */
    transform(chunk, controller) {
        return __awaiter(this, void 0, void 0, function* () {
            chunk = yield chunk;
            switch (typeof chunk) {
                case 'object':
                    if (chunk === null) {
                        // Null sounds like string termination
                        controller.terminate();
                    }
                    else if (chunk instanceof Uint8Array) {
                        // Uint8Array is pure identity
                        controller.enqueue(chunk);
                    }
                    else if (ArrayBuffer.isView(chunk)) {
                        // Any other array/arraybuffer
                        controller.enqueue(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength));
                    }
                    else if (Array.isArray(chunk) && chunk.every((value) => typeof value === 'number')) {
                        // Pure number array can be converted to uint8array (hopefully)
                        controller.enqueue(new Uint8Array(chunk));
                    }
                    else if (Array.isArray(chunk) && chunk.every((value) => typeof value === 'string')) {
                        // String arrays will be concatenated to a single string and then processed as string
                        yield this.transform(chunk.join(''), controller);
                    }
                    else if ('toJSON' in chunk) {
                        // If object has an toJson function it will be called
                        yield this.transform(JSON.stringify(chunk), controller);
                    }
                    else {
                        // Other objects will be turned into string ... badly
                        controller.enqueue(ToUint8Transformer.textencoder.encode(String(chunk)));
                    }
                    break;
                case 'symbol':
                    controller.error('Cannot send a symbol as a chunk part');
                    break;
                case 'undefined':
                    controller.error('Cannot send undefined as a chunk part');
                    break;
                default:
                    controller.enqueue(ToUint8Transformer.textencoder.encode(String(chunk)));
                    break;
            }
        });
    }
}
/** Static textencoder instance */
ToUint8Transformer.textencoder = new TextEncoder();
/**
 * Shortcut to create a zip stream from an array of files
 *
 * @param readableStream Stream to transform
 * @returns Readable stream to read zip from
 */
export function getUint8Transformer(readableStream) {
    return readableStream
        .pipeThrough(new TransformStream(new ToUint8Transformer()));
}
