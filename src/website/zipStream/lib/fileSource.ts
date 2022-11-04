/**
 * @file Controller component used by the stream stream zip data
 */

import delay from 'delay';

import {getUint8Transformer} from './toUint8Transformer';

import type {TInputTypes} from './toUint8Transformer';

/** Allowed types for data input */
type TFileInput = string | Blob | Response | ReadableStream<TInputTypes> | null;


/** Single entry for internal log */
export interface ILogEntry {
    /** Name of file for logentry */
    filename: string;
    /** Timestamp when creation was started */
    startTime: number;
    /** Timestamp when creation ended */
    endTime: number;
    /** Errorstring in case of error */
    errorstring?: string;
}

/**
 * A single file to be put in zip file.
 * Function is resolved "on demand" and may point to arbitrary complex functions.
 */
export interface IFileInput {
    /** Filename to store in ZIP */
    filename: string;
    /** File content */
    content: () => Promise<TFileInput> | TFileInput;
    /** Modification date */
    lastModified?: number;
    /** File comment */
    comment?: string;
    /**
     * If this is set content is ignored and a report file for creation is written instead.
     * This should be the last file entry - otherwise the report is incomplete.
     */
    errorReport?: (logs: ILogEntry[]) => string | Promise<string>;
}

/**
 * Simplified file object
 */
export interface IFileStream {
    /** Filename to store in ZIP */
    filename: string;
    /** Data stream */
    stream: ReadableStream<Uint8Array> | null;
    /** Modification date */
    lastModified: number;
    /** File comment */
    comment?: string;
    /**
     * If this is set content is ignored and a report file for creation is written instead.
     * This should be the last file entry - otherwise the report is incomplete.
     */
    errorReport?: (logs: ILogEntry[]) => string | Promise<string>;
}

/**
 * Source helper for filestream.
 */
// eslint-disable-next-line no-undef
export class FileSource implements UnderlyingSource<IFileStream> {
    /** Active position in file list */
    private position: number = 0;

    /** All files to provide */
    private readonly files: IFileInput[] = [];

    /** If the stream should abort / cancel at the next possible occasion */
    private shouldAbort: boolean = false;

    /** Entries regarding the state of file transfers */
    private readonly logEntries: ILogEntry[] = [];

    /**
     * Base constructor
     *
     * @param files Array of file objects that should be added to zip.
     */
    public constructor(files: IFileInput[]) {
        this.files.push(...files);
    }

    /** Listener thats called when job is done */
    public onFinish: () => void = () => { /* NO OP */ };

    /** Listener thats called when something has changed */
    public onChange: () => void = () => { /* NO OP */ };

    /** Listener thats called on error */
    public onError: (err: unknown) => void = () => { /* NO OP */ };

    /** Listener thats called on minor, revocerable errors */
    public onWarn: (err: unknown) => void = () => { /* NO OP */ };

    /** Command to abort the process at the next possible occation */
    public abort(): void {
        this.shouldAbort = true;
    }

    /**
     * Function called to fetch new data
     *
     * @param ctrl Backchannel to communicate with stream
     */
    // eslint-disable-next-line no-undef
    public async pull(ctrl: ReadableStreamDefaultController<IFileStream>): Promise<void> {
        while (this.position < this.files.length && ! this.shouldAbort) {
            const startTime = Date.now();
            const file = this.files[this.position];
            const lastModified = file.lastModified ?? Date.now();
            const filename = file.filename.trim();
            const comment = file.comment;
            try {
                const stream = file.errorReport
                    ? new Response(await file.errorReport(this.logEntries)).body
                    : await this.getStream(file.content);
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
            } catch (err) {
                this.onWarn(new Error('Could not open/enqueue stream'));
                this.onChange();
                this.position++;
                this.logEntries.push({
                    startTime,
                    filename,
                    endTime: Date.now(),
                    errorstring: (err as Error).message,
                });
                await delay(1);
            }
        }
        ctrl.close();
        this.onFinish();
    }

    /**
     * Return number of files.
     *
     * @returns Numer of files
     */
    public getFileCount(): number {
        return this.files.length;
    }

    /**
     * Return number of files.
     *
     * @returns Numer of files
     */
    public getPosition(): number {
        return this.position;
    }

    /**
     * Return filename in progress.
     *
     * @returns Filename
     */
    public getFilename(): string {
        const {position, files} = this;
        return position < files.length ? files[position].filename : '';
    }

    /**
     * Returns a readable data stream for the given content function.
     * On errors emtpy files are generated.
     *
     * @param contentFu Function generating the content
     * @returns Readable data stream
     */
    private async getStream(contentFu: () => TFileInput | Promise<TFileInput>): Promise<ReadableStream<Uint8Array>> {
        const content = await contentFu();
        const stream = content instanceof ReadableStream
            ? getUint8Transformer(content)
            : content instanceof Response
                ? content.body
                : new Response(content).body
            ;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return stream ?? new Response('').body!;
    }
}
