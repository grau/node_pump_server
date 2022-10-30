/**
 * @file All database interfaces
 */

/** Simple file index */
export interface IFileIndex {
    /** Name of file */
    filename: string;
    /** If the file was already fetched */
    fetched: 0 | 1;
}
