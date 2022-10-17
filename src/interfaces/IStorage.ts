/**
 * @file Storage related data structures
 */

/** Single data series */
type TSeries = [number, number][];

/** Database result transformed in array of series */
export interface ISeriesData {
    /** Input series */
    input0: TSeries;
    /** Input series */
    input1: TSeries;
    /** Input series */
    input2: TSeries;
    /** Input series */
    input3: TSeries;
    /** Output series */
    out0: TSeries;
    /** Output series */
    out1: TSeries;
}
