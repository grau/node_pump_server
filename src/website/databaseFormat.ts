/**
 * @file All database interfaces
 */

/** Simple file index */
export interface IFileIndex {
    /** Name of file */
    filename: string;
    /** Timestamp of this index entry */
    lastChanged: number;
    /** When the file was fetched. Null if not at all */
    fetched: number;
}
