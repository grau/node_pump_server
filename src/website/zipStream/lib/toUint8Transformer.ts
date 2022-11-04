/**
 * @file Transform stream to transform streams from other formats to uint8array streams
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TransformStream
 */

export type TInputTypes = string | ArrayBuffer | number[] | string[] | Uint8Array | Uint16Array | Uint32Array;

export class ToUint8Transformer implements Transformer<string, Uint8Array> {
    /** Static textencoder instance */
    private static readonly textencoder = new TextEncoder();

    /**
     * Called when a chunk written to the writable side is ready to be transformed, and performs the work of the
     * transformation stream.
     *
     * Transforms quite anything to uint8array
     *
     * @param chunk Data to wrote
     * @param controller Output controller to write to
     */
    public async transform(chunk: TInputTypes | Promise<TInputTypes>,
        controller: TransformStreamDefaultController<Uint8Array>): Promise<void> {
        chunk = await chunk;
        switch (typeof chunk) {
            case 'object':
                if (chunk === null) {
                // Null sounds like string termination
                    controller.terminate();
                } else if (chunk instanceof Uint8Array) {
                // Uint8Array is pure identity
                    controller.enqueue(chunk);
                } else if (ArrayBuffer.isView(chunk)) {
                // Any other array/arraybuffer
                    controller.enqueue(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength));
                } else if (Array.isArray(chunk) && (chunk as number[]).every((value) => typeof value === 'number')) {
                // Pure number array can be converted to uint8array (hopefully)
                    controller.enqueue(new Uint8Array(chunk as number[]));
                } else if (Array.isArray(chunk) && (chunk as string[]).every((value) => typeof value === 'string')) {
                // String arrays will be concatenated to a single string and then processed as string
                    await this.transform((chunk as string[]).join(''), controller);
                } else if ('toJSON' in chunk) {
                // If object has an toJson function it will be called
                    await this.transform(JSON.stringify(chunk), controller);
                } else {
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
    }
}

/**
 * Shortcut to create a zip stream from an array of files
 *
 * @param readableStream Stream to transform
 * @returns Readable stream to read zip from
 */
export function getUint8Transformer(readableStream: ReadableStream<TInputTypes>): ReadableStream<Uint8Array> {
    return readableStream
        .pipeThrough(new TransformStream(new ToUint8Transformer()));
}
